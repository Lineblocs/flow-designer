var testJSON = '{"graph":{"cells":[{"type":"devs.LaunchModel","size":{"width":256,"height":128},"inPorts":[],"outPorts":["Incoming Call"],"ports":{"groups":{"in":{"position":"top","label":{"position":"outside"},"attrs":{".port-label":{"fill":"#000"},".port-body":{"fill":"#fff","stroke":"#000","r":10,"magnet":true}}},"out":{"position":"bottom","label":{"position":"outside"},"attrs":{".port-label":{"fill":"#000"},".port-body":{"fill":"#fff","stroke":"#000","r":10,"magnet":true}}}},"items":[{"id":"Incoming Call","group":"out","attrs":{".port-label":{"text":"Incoming Call"}}}]},"position":{"x":633.275,"y":320},"angle":0,"id":"968cc99c-00f3-49b7-8b40-9e3b8bfd1b24","z":1,"attrs":{}},{"type":"devs.SwitchModel","size":{"width":256,"height":128},"inPorts":["In"],"outPorts":["No Condition Matches"],"ports":{"groups":{"in":{"position":"top","label":{"position":"outside"},"attrs":{".port-label":{"fill":"#000"},".port-body":{"fill":"#fff","stroke":"#000","r":10,"magnet":true}}},"out":{"position":"bottom","label":{"position":"outside"},"attrs":{".port-label":{"fill":"#000"},".port-body":{"fill":"#fff","stroke":"#000","r":10,"magnet":true}}}},"items":[{"id":"In","group":"in","attrs":{".port-label":{"text":"In"}}},{"id":"No Condition Matches","group":"out","attrs":{".port-label":{"text":"No Condition Matches"}}},{"id":"COndition Matches1","group":"out","args":{},"label":{"position":{"name":"bottom","args":{}}},"attrs":{"text":{"text":"COndition Matches1"}}}]},"position":{"x":390,"y":535},"angle":0,"id":"02e814fe-abfb-4fa0-afcd-e74949f52553","z":1,"attrs":{}},{"type":"devs.DialModel","size":{"width":256,"height":128},"inPorts":["In"],"outPorts":["Busy","No Answer","Call Failed"],"ports":{"groups":{"in":{"position":"top","label":{"position":"outside"},"attrs":{".port-label":{"fill":"#000"},".port-body":{"fill":"#fff","stroke":"#000","r":10,"magnet":true}}},"out":{"position":"bottom","label":{"position":"outside"},"attrs":{".port-label":{"fill":"#000"},".port-body":{"fill":"#fff","stroke":"#000","r":10,"magnet":true}}}},"items":[{"id":"In","group":"in","attrs":{".port-label":{"text":"In"}}},{"id":"Busy","group":"out","attrs":{".port-label":{"text":"Busy"}}},{"id":"No Answer","group":"out","attrs":{".port-label":{"text":"No Answer"}}},{"id":"Call Failed","group":"out","attrs":{".port-label":{"text":"Call Failed"}}}]},"position":{"x":989,"y":643},"angle":0,"id":"40f20d53-a1d1-45ab-90d8-1d8ba89e3467","z":2,"attrs":{}},{"type":"link","source":{"id":"968cc99c-00f3-49b7-8b40-9e3b8bfd1b24","port":"Incoming Call"},"target":{"id":"02e814fe-abfb-4fa0-afcd-e74949f52553","port":"In"},"id":"ddba670c-1bf6-4546-94b0-36529311d085","z":3,"vertices":[{"x":639.6375,"y":491.5}],"attrs":{}},{"type":"link","source":{"id":"02e814fe-abfb-4fa0-afcd-e74949f52553","port":"COndition Matches1"},"target":{"id":"40f20d53-a1d1-45ab-90d8-1d8ba89e3467","port":"In"},"id":"c1b48b5b-f1c8-4474-a44c-59725aaa92d4","z":4,"vertices":[{"x":817.5,"y":653}],"attrs":{}}]},"models":[{"id":"968cc99c-00f3-49b7-8b40-9e3b8bfd1b24","name":"Untitled Widget","data":{},"links":[]},{"id":"02e814fe-abfb-4fa0-afcd-e74949f52553","name":"test 1234","data":{},"links":[{"to":null,"type":"LINK_CONDITION_MATCHES","value":"12345","label":"COndition Matches1"}]},{"id":"40f20d53-a1d1-45ab-90d8-1d8ba89e3467","name":"Untitled Widget","data":{},"links":[]}]}';