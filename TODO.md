O fix expander
O make sizes of code areas adjustable
O show error message for tests
O allow disable test
O show results by browsers?
O if ?debug then show header github counts
O why is save missing?
O add hints
O load revisions

O run benchmarks in iframe? Issue, user has gist credientials so
  need to make sure tests can't post them.

  didn't work. iframe via blob is same origin. Turn off same origin
  and can't run blob. Could dataURL it?

  no, dataURL gets same origin

  as iframe with allow-scripts seems to work

  new solution, remove credientials from localStorage,
  then run benchmarks, the put it back, on close also put them back
  ?
  
  -new problem-, other pages from same domain can read credentials

  solution: jsbenchit.org

O allow saving by hand (json)
O allow loading by hand (json)
O allow saving to URL zip->base64?