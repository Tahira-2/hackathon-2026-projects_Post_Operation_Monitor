# Symptom Mapping Source Notes

These notes describe broad, non-diagnostic triage references used for cue-based symptom routing.

## References used
- [NHS common cold guidance](https://www.nhs.uk/conditions/common-cold/)
- [NHS cough symptoms guidance](https://www.nhs.uk/symptoms/cough/)
- [NHS rashes and skin irritation guidance](https://www.nhsinform.scot/illnesses-and-conditions/skin/rashes-irritation-and-swelling/)
- [Primary care approach to abdominal pain in adults (PMC)](https://pmc.ncbi.nlm.nih.gov/articles/PMC8378095/)
- [Acute abdominal pain (MSD Manual Professional)](https://www.msdmanuals.com/professional/gastrointestinal-disorders/acute-abdomen-and-surgical-gastroenterology/acute-abdominal-pain)
- [Abdominal and flank pain with renal causes (PMC)](https://pmc.ncbi.nlm.nih.gov/articles/PMC4760602/)

## Implementation rule in this prototype
- Routing is based on matched symptom cues from long free-text input (not a single fixed symptom rule).
- Supported cue groups include respiratory, dermatology, gastrointestinal, urinary/flank, and neurology-oriented signals.
- If no rule cues match, route to fallback `General Practice`.
- Specialist routing should be escalated by additional red-flag context passed from API.
- Core logic stays deterministic and non-diagnostic.
