# Documentazione tecnica e linee guida per refactor in Next.js

Questa guida descrive lo stato attuale del backend “Calcolatore Cedolini CCNL Domestico” e fornisce le informazioni necessarie per reimplementare la logica in un progetto **Next.js** (ad esempio dentro una Route Handler o nel layer Server Actions). Include i riferimenti ai moduli Python esistenti, l’input/output dell’unico endpoint e i valori dei **minimi contrattuali** da portare nel nuovo stack.

---

## 1. Architettura attuale

| Elemento                 | Descrizione                                                                 | File chiave                                               |
| ------------------------ | --------------------------------------------------------------------------- | --------------------------------------------------------- |
| Runtime                  | Google Cloud Functions (Python 3.8) esposta via HTTP                        | `deploy.sh`, `deploy.ps1`                                 |
| Entry point              | Funzione `main(request)` decorata con `@functions_framework.http`           | `src/main.py`                                             |
| Modulo validazione input | Calcolo ore settimanali/mensili, imposizione minimi, controlli contrattuali | `src/modules/inputdata/inputdata.py`                      |
| Modulo calcoli economici | Paga lorda/netta, indennità, casse e contributi                             | `src/modules/calculator/calculator.py`                    |
| Costanti contrattuali    | Minimi retributivi, indennità, limiti orari                                 | `src/modules/contractualVariables/cotractualVariables.py` |

Il flusso è lineare:

1. **CORS & request parsing** (`src/main.py`).
2. **Validazione e normalizzazione input** → `inputdatacontrol` e `calcola_indennità_extra`.
3. **Calcoli economici** → funzioni in `calculator.py`.
4. **Assemblaggio risposta JSON** con valori per lavoratore e datore di lavoro.

---

## 2. Contratto HTTP

### Richiesta (JSON)

| Campo                                                                                                 | Tipo         | Note                                                                                                 |
| ----------------------------------------------------------------------------------------------------- | ------------ | ---------------------------------------------------------------------------------------------------- |
| `durataContratto`                                                                                     | string       | `indeterminato`, `determinato`, `determinato_in_sostituzione`                                        |
| `tipoContratto`                                                                                       | string       | `convivente`, `part-time`, `nonconvivente`, `assistenza`, `presenza`, `sostituzione`                 |
| `livelloContratto`                                                                                    | string       | Dipende dal tipo (es. `a`, `bs`, `cs`, `u`, `ds`)                                                    |
| `oreLunedi` … `oreDomenica`                                                                           | string/int   | Numero ore giornaliere; almeno un giorno deve essere 0                                               |
| `paga`                                                                                                | string/float | Lordo mensile per contratti conviventi/part-time, orario per altri; se 0 viene sostituito dal minimo |
| `bambino_6_anni`, `piu_persone`, `certificato_uni`, `pranzo_natura`, `cena_natura`, `alloggio_natura` | string       | Valori `si`/`no` per indennità aggiuntive                                                            |

> Nota: prima della refactor è necessario rendere questi campi **tipizzati** sul lato Next.js (es. `zod` o `yup`) e validare che gli orari siano numeri interi non negativi.

### Risposta (JSON)

```jsonc
{
  "pagalorda-lavoratore": 0.0,
  "contributicolf-lavoratore": 0.0,
  "contributiinps-lavoratore": 0.0,
  "paganetta-lavoratore": 0.0,
  "contributicolf-datore": 0.0,
  "contributiinps-datore": 0.0,
  "indennita-tfr": 0.0,
  "indennita-ferie": 0.0,
  "indennita-tredicesim": 0.0,
  "costototale-datore": 0.0,
  "indennita-tot": 0.0,
  "indennita-cibo": 0.0,
  "paga-domenica": 0.0,
  "paga-netta": 0.0 // valore base inserito dall’utente
}
```

---

## 3. Valori dei minimi e indennità

### Minimi retributivi (da convertire in costanti Next.js)

#### Contratti conviventi (mensile)

| Livello | Valore € |
| ------- | -------- |
| A       | 729.25   |
| AS      | 861.86   |
| B       | 928.15   |
| BS      | 994.44   |
| C       | 1060.76  |
| CS      | 1127.04  |
| D       | 1521.99  |
| DS      | 1588.28  |

#### Part-time conviventi (mensile)

| Livello | Valore € |
| ------- | -------- |
| B       | 662.96   |
| BS      | 696.13   |
| C       | 769.02   |

#### Non conviventi (orario)

| Livello | Valore € |
| ------- | -------- |
| A       | 5.30     |
| AS      | 6.24     |
| B       | 6.62     |
| BS      | 7.03     |
| C       | 7.42     |
| CS      | 7.83     |
| D       | 9.03     |
| DS      | 9.41     |

#### Assistenza notturna convivente (mensile)

| Livello | Valore € |
| ------- | -------- |
| BS      | 1143.60  |
| CS      | 1296.09  |
| DS      | 1601.09  |

#### Presenza notturna (mensile)

| Livello | Valore € |
| ------- | -------- |
| U       | 765.71   |

#### Sostituzione (orario)

| Livello | Valore € |
| ------- | -------- |
| CS      | 8.41     |
| DS      | 10.15    |

### Indennità e costanti aggiuntive

- Babysitter bambini fino a 6 anni:
  - Non conviventi: €0.79/ora
  - Part-time: €91.63/mese
  - Full-time/conviventi/assistenza: €130.78/mese
- Più persone non autosufficienti:
  - Conviventi/assistenza: €112.97/mese
  - Non conviventi o sostituzione: €0.66/ora
- Certificazione UNI11766/2019:
  - Livello B: €9.04/mese
  - Livelli BS/CS: €11.30/mese
- Indennità vitto/alloggio (solo conviventi): pranzo €2.28, cena €2.28, alloggio €1.96, pacchetto vitto+alloggio €6.52.
- Limiti orari: giornaliero conviventi/part-time/assistenza/presenza 10h, non conviventi 8h, sostituzione 12h; settimanale conviventi 54h, part-time 30h, non conviventi/sostituzione 40h.
- Coefficienti ricorrenti: settimane medie mese 4.33, maggiorazione domenicale 1.6, Cassa Colf lavoratore €0.02/ora, datore €0.04/ora.

---

## 4. Logica di business (breve guida per il porting)

1. **Validazione input** (`inputdatacontrol`)
   - Forza `paga >= salario_minimo` in base a tipo/livello.
   - Richiede almeno un giorno con 0 ore, ore intere ≥ 0 e entro i limiti per tipologia.
   - Calcola: giorni lavorati, totale ore settimanali, totale ore mensili (×4.33), ore domenicali mensili.
2. **Indennità extra** (`calcola_indennità_extra`)
   - Valuta flag `si/no` per bambino, certificato, vitto/alloggio ecc.
   - Restituisce sei valori (cena, pranzo, alloggio, bambino, non autosufficienti, certificato).
3. **Calcoli economici** (`calculator.py`)
   - `calcola_paga_lorda`: distingue contratto convivente (paga mensile + indennità) vs orario.
   - `cassa_colf`, `tredicesima`, `ferie`, `tfr`: usano i coefficienti cv.\*.
   - `contributiinps`: determina l’aliquota in base al monte ore settimanale, tipo di contratto e retribuzione oraria (base contributiva).
   - `costifinali`: paga netta = lorda − contributi lavoratore − Cassa Colf lavoratore; costo datore = lorda + contributi datore + accantonamenti.

Quando si migra in Next.js:

- Portare tali funzioni in moduli TypeScript separati (es. `lib/calculator/*`) mantenendo la stessa segmentazione logica per favorire il testing.
- Usare `big.js` o `Decimal.js` se serve maggiore precisione sui decimali.

---

## 5. Piano di refactor verso Next.js

1. **Creare monorepo o repo unica Next.js** con `/app/api/calculator/route.ts` (o una funzione serverless analoga) che sostituisca `main`.
2. **Trascrivere i moduli**:
   - `contractualVariables` → `lib/contract/constants.ts`
   - `inputdata` → `lib/contract/input.ts` (validation + helpers)
   - `calculator` → `lib/contract/calculator.ts`
3. **Validazione** con schema TypeScript (es. `zod`) per garantire tipi sicuri lato client e server.
4. **Gestione CORS**: se necessario, usare middleware Next.js o configurare le Route Handler per supportare richieste cross-origin.
5. **Testing**: aggiungere unit test (Jest / Vitest) per ogni funzione portata per assicurare parità di risultato con l’implementazione Python.
6. **Deployment**: scegliere Vercel/Cloud Run/Firebase Functions. Assicurarsi che i file di configurazione (es. `vercel.json`) espongano l’endpoint `/api/calculator`.

---

## 6. Attività consigliate prima della migrazione

- Convertire `src/requirements.txt` in UTF-8 (attuale encoding corrotto) nel caso serva ancora per manutenzione.
- Rimuovere dal repo qualsiasi token o credenziale hardcoded (es. `src-proxy/main.py`).
- Aggiungere sample request/response aggiornate e automatizzare i test di regressione (screenshot delle ricevute, snapshot JSON, ecc.).

---

## 7. Frontend attuale (repo corrente)

Il repository contiene **solo il client** HTML/CSS/JS destinato a essere embeddato in una pagina marketing. Tutta la logica vive in global scope dentro `index.js`, senza bundler o dipendenze NPM. Conoscere il suo funzionamento facilita il porting verso Next.js o verso componenti riutilizzabili.

### 7.1 File rilevanti

| File                                      | Ruolo                                                                                     |
| ----------------------------------------- | ----------------------------------------------------------------------------------------- |
| `index.html`                              | Struttura del wizard (selettori contratto/livello/durata, orari settimanali, simulazione) |
| `style.css`, `style_from_bazeapp_com.css` | Stili proprietari                                                                         |
| `index.js`                                | Tutta la logica di interazione, validazione e chiamata ai webhook                         |
| `index_July.js`                           | Variante legacy/non utilizzata nel markup                                                 |

### 7.2 Inizializzazione e precompilazione

- La funzione `main(url)` legge i query param `location`, `avg-price`, `type-job`, `contract-level`, `contract-time`, `number-hours` e li riflette sulla UI (selezione boxes, label informative e testo `"Prezzo medio..."`).
- L’embed previsto passa questi parametri tramite i pulsanti CTA della homepage: il refactor in Next.js dovrà quindi supportare la stessa semantica di URL per mantenere la parità di comportamento lato marketing.

### 7.3 Stato condiviso e validazioni lato client

- Lo stato delle selezioni è gestito da variabili globali (`selections`, `tipocontrattoselezionato`, `livellocontrattoselezionato`, `duratacontrattoselezionato`, `paga`, flag sui benefit). In Next.js conviene incapsularle in componenti o hook per evitare side-effect globali.
- La UI espone funzioni come `selectChoice`, `sceglipaga`, `selectVittoAlloggio`, `selectBambino`, ecc. che rispondono agli `onclick` definiti nell’HTML.
- La validazione client replica parte delle regole del backend:
  - Funzione `updateTotals` calcola ore/giorni e mostra alert se si superano `contractLimits` (oggetto con max giornalieri/settimanali per tipo contratto) o se manca un giorno di riposo.
  - `sceglipaga` imposta placeholder minimi CCNL per paga oraria/mensile e `formatPaga` forza il rispetto dei minimi (se l’utente inserisce meno del placeholder, viene riallineato).
  - Prima della chiamata remota `areAllFieldsFilled` e `isAtLeastOneDayGreaterThanZero` bloccano l’invio se ci sono campi vuoti o tutte le ore sono zero.
- Queste verifiche sono UX-critical: nel refactor devono vivere lato client (per feedback immediato) **e** lato server (per sicurezza).

### 7.4 Flussi di invio dati

1. **Calcolo simulazione**

   - `#sendRequest` raccoglie i dati del form in un payload identico al contratto HTTP descritto nella sezione 2.
   - Il payload viene inoltrato a `https://hook.eu1.make.com/asor6kjlu4bbl2eemv3nlbjhb5sr39hb` (`sendToWebhookToCalculate`). Questo scenario Make fa da proxy verso la Cloud Function Python.
   - La risposta JSON popola la tabella simulazione tramite `updateSimulazione`, che assegna i valori ai campi `#pagalorda-lavoratore`, `#contributiinps-datore`, ecc. e salva l’intero oggetto in `risultatiSimulazione`.

2. **Invio simulazione via email**
   - Il bottone "Ricevi via email" apre un modal (`#popup-application`) e `formRiceviViaEmail` spedisce i dati già calcolati + email dell’utente a `https://hook.eu1.make.com/dyfpkkq8iouyk0aa7i1cqe387iy7okv4`.
   - Il payload include sia gli input originali sia i risultati (`...risultatiSimulazione`). Nel porting bisogna preservare questa seconda chiamata oppure sostituirla con un’azione server-side Next.js che re-inoltra i dati a CRM/ESP.

### 7.5 UX e componenti notevoli

- La scelta dei livelli (`sceltaLivello`) controlla la visibilità dei pannelli `#a`, `#bs`, ecc. in base al tipo di contratto; replicare questa mappa in componenti React eviterà regressioni.
- I contatori orari (`increaseHours`, `decreaseHours`) si appoggiano a input numerici e aggiornano automaticamente la CTA (`#sendRequest`) e il widget `#stats-container`.
- `resetCalculator` clear-a tutta la UI (selezioni, placeholder, valori della tabella). Durante il refactor conviene trasformarlo in una singola action che ripristina lo stato iniziale del componente.

### 7.6 Implicazioni per Next.js

- **Componentizzazione**: una suddivisione naturale è `ContractTypeSelector`, `ContractLevelGrid`, `WorkloadPlanner`, `ExtraBenefits`, `SummaryModal`. Ogni componente può usare server/client components di Next.js a seconda delle esigenze.
- **Data fetching**: spostare le chiamate ai webhook verso route `/api/calculator` e `/api/send-summary` elimina la dipendenza da Make e mantiene i segreti lato server. Il client chiamerà solo endpoint interni.
- **Sharing logic con backend**: i minimi contrattuali e `contractLimits` sono oggi duplicati lato frontend. Centralizzarli in un package (es. `@app/contract/constants`) e importarli sia nelle UI che nelle Server Actions evita drift rispetto al calcolatore server-side.
- **Embedded mode**: se il widget resterà embeddabile, prevedere una pagina `app/embed/calcolatore/page.tsx` esportabile come iframe e leggere i query param con `searchParams` per riprodurre l’attuale `main(url)`.

---

Con questo documento è possibile replicare la logica esistente nella nuova codebase Next.js mantenendo i vincoli del CCNL domestico e i calcoli contributivi esistenti. Per dubbi o aggiornamenti sui valori contrattuali fare riferimento all’ultimo rinnovo CCNL e aggiornare la sezione “Minimi retributivi” di conseguenza.
