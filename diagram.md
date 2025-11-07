```mermaid
flowchart TD
    %% Entry
    start([Widget embed / query params]) --> intro[Intro card · Inizia]

    %% Step 1
    subgraph step1 [Step 1 · Tipo contratto]
        intro --> contract{Scegli contratto}
        contract -->|Convivente| contract_conv[Limiti 10h/giorno · 54h/settimana]
        contract -->|Non convivente| contract_nonconv[Limiti 8h/giorno · 40h/settimana]
    end

    %% Step 2
    subgraph step2 [Step 2 · Ruolo]
        contract_conv & contract_nonconv --> role_base[Colf obbligatoria (lock)]
        role_base --> role_bb{Aggiungi Babysitter?}
        role_base --> role_bd{Aggiungi Badante?}
        role_bb -->|Sì| role_bb_yes[Profilo \"Colf + Babysitter\"]
        role_bb -->|No| role_bb_no[Nessuna babysitter]
        role_bd -->|Sì| role_bd_yes[Profilo \"Colf + Assistenza\"]
        role_bd -->|No| role_bd_no[Nessuna badante]
    end

    %% Step 3
    subgraph step3 [Step 3 · Ore settimanali]
        role_bb_yes & role_bb_no & role_bd_yes & role_bd_no --> hours_day[Domanda 1:<br/>Ore per giorno]
        hours_day --> hours_days[Domanda 2:<br/>Giorni lavorativi (1‑6 lun-sab)]
        hours_days --> hours_total[Calcolo ore settimanali]
        hours_total --> hours_limit{Supera limite contratto?}
        hours_limit -->|Sì| hours_day
    end

    hours_limit -->|No| summary[Step 4 · Riepilogo<br/>Durata indeterminato (fixed)]
    summary --> submit[CTA Calcola il costo<br/>POST /api/calculator]
    submit --> results[Hero \"Quanto paghi con Baze\" + Totale costo]

    %% Results actions
    results --> detailsBtn[CTA Consulta i dettagli del costo]
    results --> searchBtn[CTA Trova una Colf gratuitamente]
    searchBtn --> onboarding[Redirect<br/>https://app.bazeapp.com/onboarding/iscrizione]

    %% Email gate
    subgraph gate [Email gate per breakdown]
        detailsBtn --> dialog[Dialog Email + Privacy]
        dialog --> sendSummary[POST /api/send-summary]
        sendSummary --> gateOutcome{Esito?}
        gateOutcome -->|Successo| unlock[Mostra grafico a torta + breakdown]
        gateOutcome -->|Errore| dialog
    end
```
