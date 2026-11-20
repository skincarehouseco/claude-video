# Skin Talks — permanent hosts (identity lock)

Source of truth: `hosts_reference.png` (the creator-approved image). Never regenerate new faces; every shot, clip or
still must be derived from this image (or from footage generated *from* it with an identity-preserving tool).
Reference crops: `maya_face_ref.png`, `maya_closeup_ref.png`, `nadia_face_ref.png`, `nadia_closeup_ref.png`.

## Maya — Host (left)
- **Look:** face exactly as in the reference; ivory/cream chiffon hijab, softly draped; white casual blouse (no blazer);
  warm, open smile with visible teeth; light natural makeup, rosy lips; expressive open-hand gestures.
- **Personality:** sweet, bubbly, curious; asks the relatable questions the audience would ask; reacts with surprise
  ("Serius?", "Ohh…") — cheerful but never childish.
- **Voice:** `voices.json → hosts.maya` (Malaysian-TTS `idayu`, seed 1100, temp 0.7). Bright, ~270 Hz median pitch.
- **Speech style:** casual Malaysian BM–English rojak, "I/you" pronouns, short questions.

## Nadia — Co-Host (right)
- **Look:** face exactly as in the reference; soft taupe hijab with a small gold pin at the side; tailored beige
  corporate blazer over a cream top; gold watch; composed smile; chin-on-hand / calm posture.
- **Personality:** professional, confident, intelligent, calm, slightly witty skincare educator.
  **Not** a doctor — never give her a medical title or a white coat; she refers people to a doctor when appropriate.
- **Voice:** `voices.json → hosts.nadia` (Malaysian-TTS `singaporean` female, seed 2200, temp 0.6). Calmer, ~196 Hz.
- **Speech style:** clear explanations in BM with English skincare terms; uses "Actually…", "Betul."

## Prompt block for external lip-sync / video tools (copy as-is)
> Two Malaysian women in their late 20s hosting a skincare podcast in a bright cream-and-beige studio with soft daylight,
> indoor plants, a "Skin Talks by Skincarehouse" sign, black podcast microphones and Skincarehouse mugs. LEFT: Maya —
> ivory hijab, white casual blouse, bubbly and expressive. RIGHT: Nadia — soft taupe hijab with a small gold pin, tailored
> beige blazer, gold watch, calm and confident. Keep both faces identical to the reference image. Natural blinking,
> subtle head movement; only the speaking host moves her lips; the listener nods and reacts silently. No dark grading,
> no yellow cast, no plastic skin.
