## 1. Overview

Embedded Next.js widget che aiuta le famiglie a stimare il costo mensile di una collaboratrice domestica. L’esperienza vive nella homepage e deve funzionare come configuratore “wizard” leggero: poche domande sequenziali, risultati immediati (CTA contatti + “invia via email”). Il calcolatore sostituisce la versione legacy mantenendo compatibilità con i parametri URL d’ingresso.

## 2. Goals

- Rendere il flusso compilazione semplice (≤ 4 step) eliminando decisioni tecniche sulle tipologie contrattuali.
- Mappare automaticamente le scelte dell’utente verso i livelli CCNL e le indennità necessarie, mantenendo la correttezza dei calcoli.
- Fornire output leggibile (numeri + grafico a torta) pronto da embeddare e riutilizzare in altri canali.
- Raccogliere i dati necessari per inviare la simulazione via email o aprire conversazioni commerciali.

## 5. User Stories

1. Come prospect voglio scegliere il tipo di contratto (convivente o non convivente) senza tecnicismi.
2. Come prospect voglio indicare chi mi serve (colf obbligatoria, con possibilità di aggiungere babysitter o badante) per vedere un preventivo coerente.
3. Come prospect voglio indicare solo quante ore al giorno e per quanti giorni alla settimana per ottenere il conteggio delle ore totali con avvisi se supero i limiti.
4. Come prospect voglio un risultato chiaro con la scomposizione dei costi e un grafico esplicativo.
5. Come prospect voglio spedire il risultato al mio indirizzo email oppure condividerlo con Baze.

## 6. Key Assumptions

- Paga oraria lorda = 9 €/h (non mostrata). Backend forza il rispetto dei minimi usando i livelli CCNL.
- Durata contratto = indeterminato, campo visualizzato ma non disattivabile.
- Nessun lavoro domenicale: tutti i contratti coprono solo lun-sab.
- Ore mensili = ore settimanali × 4.33.
- Compatibilità embed: il componente legge eventuali query string preesistenti (`type-job`, `number-hours` etc.) e precompila gli step equivalenti.

### 7 Step flow (desktop & mobile)

1. **Step 1 – Tipo di contratto**

   - Due radio card “Convivente” e “Non convivente”.

2. **Step 2 – Ruolo**

   - Tre card orizzontali: `Colf (obbligatoria)`, `Aggiungi Babysitter`, `Aggiungi Badante`.
   - Colf appare già attiva con icon lock (tooltip: “tutte le richieste includono una colf”).
   - Babysitter e Badante sono toggle; stato persistente nello store.
   - Niente lettering CCNL: i testi descrivono solo i servizi (“Supporto ai bambini”, “Assistenza a persone fragili”).

3. **Step 3 – Ore settimanali**

   - **Domanda 1**: “Di quante ore hai bisogno al giorno?” (numeric input + slider). Range dinamico: convivente [1‑10], non convivente [1‑8].
   - **Domanda 2**: “Per quanti giorni (lun‑sab)?” Stepper 1‑6.
   - Nessuna opzione domenicale: il copy spiega che Baze organizza solo turni lun‑sabato.
   - Riepilogo live: `Totale ore settimanali = ore/giorno × giorni`. Se supera il limite, evidenzia l’input e disabilita CTA “Prosegui”.

4. **Step 4 – Riepilogo & call to action**

   - Campo “Contratto a tempo indeterminato” mostrato come pill deselezionata. Tooltip spiega l’assunzione.
   - Bottone `Calcola il costo` invia i dati all’API `/api/calculator`.

5. **Risultati**

   - Hero “Quanto paghi con Baze” con il costo totale datore (€/mese) e micro-copy rassicurante.
   - Due CTA:
     1. `Consulta i dettagli del costo` → apre dialog gated.
     2. `Trova una Colf gratuitamente` → link `https://app.bazeapp.com/onboarding/iscrizione` (nuova tab, UTM opzionali).
   - Finché il gate non è sbloccato mostriamo solo il totale e il copy.

6. **Gate email + breakdown**
   - Click su `Consulta i dettagli del costo` apre un `Dialog` con input Email obbligatorio + checkbox privacy.
   - Dopo submit:
     - Chiamata `POST /api/send-summary` (o webhook CRM) con {input, risultato, email}.
     - Mostriamo grafico a torta (`ResultsPie`) con slice `Paga netta`, `Contributi INPS datore`, `Cassa Colf`, `Accantonamenti (TFR+ferie+13ª)`.
     - Tabella dettaglio (paga lorda/netta, contributi, accantonamenti) e testo “Ti abbiamo inviato il dettaglio via email”.
   - Se errore, manteniamo il dialog aperto con messaggio inline.

### 7.2 Error / edge flows

- **Limiti orari superati**: mostra inline error (“Supera il massimo consentito per contratti conviventi: 54 ore/settimana”). CTA disabilitata.
- **Backend failure**: toast “Impossibile completare il calcolo, riprova”. Mantiene i dati inseriti.
- **Timeout grafico**: se risultato non contiene dati >0, mostra placeholder “Completa gli step per vedere il grafico”.
- **Email gate**: errori di validazione mantengono il dialog aperto e il breakdown resta nascosto finché la submission non va a buon fine.

## 8. Business Rules & Mapping

| Combinazione selezioni        | Profilo interno (non mostrato) | Note                                                                 |
| ----------------------------- | ------------------------------ | -------------------------------------------------------------------- |
| Solo Colf                     | `colf_base`                    | Usa minimi per collaboratore generico (livelli gestiti solo server). |
| Colf + Babysitter             | `colf_babysitter`              | Aggiunge indennità babysitter (0.79 €/h oppure 130.78 €/mese).       |
| Colf + Badante                | `colf_assistenza`              | Applica indennità non autosufficienti (valore orario/mensile).       |
| Colf + Babysitter + Badante   | `colf_fullcare`                | Somma di entrambe le indennità, livelli calcolati automaticamente.   |

> Le sigle A/B/BS/CS/DS sono eliminate dal frontend; restano nel backend per applicare i minimi.

## 9. API Contract

Request schema (Zod):

```ts
type CalculatorInput = {
  contractType: "convivente" | "non_convivente";
  roleSelections: {
    colf: true;
    babysitter: boolean;
    badante: boolean;
  };
  dailyHours: number;
  daysPerWeek: number;
  duration: "indeterminato";
};
```

Response schema:

```ts
type CalculatorOutput = {
  pagaLordaLavoratore: number;
  contributiColfLavoratore: number;
  contributiInpsLavoratore: number;
  pagaNettaLavoratore: number;
  contributiColfDatore: number;
  contributiInpsDatore: number;
  indennitaTfr: number;
  indennitaFerie: number;
  indennitaTredicesima: number;
  costoTotaleDatore: number;
  indennitaTot: number;
};
```

## 10. Data & Analytics

- Eventi da tracciare (PostHog/GA4):
  - `calculator_started`
  - `contract_type_selected`
  - `role_toggle` (prop: babysitter/badante)
  - `hours_configured` (props: daily, days)
  - `calculation_succeeded` (props: contractType, weeklyHours)
  - `view_details_clicked`
  - `view_details_unlocked` (prop: emailDomain, contractType)
  - `start_search_cta_clicked` (prop: contractType, weeklyHours)
- KPI principali:
  - Completion rate wizard (>65% target)
  - CTR “Consulta i dettagli” vs “Trova una Colf gratuitamente”
  - Numero di simulazioni complete per visita.

## 11. Dependencies

- shadcn/ui components (`button`, `card`, `dialog`) già installati.
- Libreria grafici (es. `recharts`) da aggiungere.
- Route `/api/send-summary` o integrazione CRM per salvare l’email e inviare i dettagli.
- Deep link onboarding: `https://app.bazeapp.com/onboarding/iscrizione` (aggiungere eventuali UTM/referral).

## 12. Open Questions

1. Il copy “Trova una Colf gratuitamente” deve includere promesse specifiche (tempi, step successivi)?
2. Quali UTM/referral parameter passare all’onboarding?
3. L’email raccolta deve ricevere automaticamente il breakdown oppure basta mostrarglielo in-app?
4. Nel calcolo bisogna includere contributi Cassa Colf fissi (0.02/0.04 €/h) come nel backend originale?

Document owner: TBD. Ultimo aggiornamento: 2025-11-07.
