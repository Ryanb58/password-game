# The (Tricky) Password Game

Simple browser puzzle: each level changes what the input must be. Read the label closely.

## Levels Summary
| Level | Prompt (label) | Required Answer | Hint |
|-------|----------------|-----------------|------|
| 1 | Enter password: | `password` | Literal word password |
| 2 | Password is incorrect | `incorrect` | Use the emphasized idea |
| 3 | Try again. | `again` | Ignore punctuation |
| 4 | Please try again later. | `again later` | Last two key words |
| 5 | The password equals the number of words in this sentence. | `10` or `the number of words in this sentence` | Either count them or type the phrase |
| 6 | Type the previous level's answer twice, no space. | double(prev) OR literal phrase OR prev + x2 | Double it or be literal |
| 7 | Enter the first 4 letters of the alphabet backwards. | `dcba` (lenient casing/spacing) OR sentence literal | Reverse A B C D |
| 8 | Enter the sum of 12 and 35, then the word sum (no space). | `47sum`, `47SUM`, `sum47`, `12+35=sum` | 12 + 35 |
| 9 | Type the current level number in binary. | `1001`, `0b1001`, `bin1001`, `9`, `binary 9` | Binary of 9 |
| 10 | Final: I speak without a mouth and hear without ears. What am I? | echo | Classic riddle |

## Run
Open `index.html` in a browser. No build steps.

## Customizing
Add or modify entries in the `levels` array inside `script.js`. Each level supports:
- `label`: string shown
- `dynamicLabel()`: optional function returning label each render
- `validator(value, ctx)`: returns true if input passes
- `answer`: static string or function returning canonical answer (used for docs/testing)
- `setup(ctx)`: optional function to derive and merge extra context properties
- `hint`: optional hint string shown after 3 failed attempts
- `preprocessInput(value)`: optional transform before validation

## License
MIT
