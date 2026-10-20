---
'@lynx-js/lynx-ui-input': patch
---

Fix Android input compatibility by removing the temporary native readonly lock
from controlled Input and TextArea editing. Reconcile rejected and transformed
values after input callbacks without rewriting accepted composing text.
