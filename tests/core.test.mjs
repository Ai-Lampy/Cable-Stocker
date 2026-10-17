// Generated test fixtures only. The supplied reference examples stay unchanged.
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import {fileURLToPath} from 'node:url';
import * as M from '../js/model.js';
import {Grid,parseTSV,toTSV,parseCell} from '../js/grid.js';
import {toWorkbook,fromWorkbook,replaceWorkbook,sheetName} from '../js/excel.js';
const root=fileURLToPath(new URL('../',import.meta.url));
const source=JSON.parse(fs.readFileSync(`${root}reference/examples/christie_lites_cable.json`));
const refs=Object.fromEntries(['categories','cable_types','connector_types','lighting_vendors','manifest'].map(k=>[k,JSON.parse(fs.readFileSync(`${root}${['manifest','lighting_vendors'].includes(k)?'reference':'data'}/${k}.json`))]));
const context={console,ArrayBuffer,Uint8Array,Date,TextEncoder,TextDecoder};vm.createContext(context);vm.runInContext(fs.readFileSync(`${root}vendor/xlsx.full.min.js`,'utf8'),context);const X=context.XLSX;
const fresh=()=>M.projectFromStock(source,'christie_lites_cable.json');
const roundtrip=(p,options)=>{const book=toWorkbook(p,X,options),bytes=X.write(book,{type:'array',bookType:'xlsx'}),reopened=X.read(bytes,{type:'array'});return fromWorkbook(reopened,X,p);};
test('authoritative stock → app → JSON preserves all fields exactly',()=>assert.deepEqual(M.runtimeJSON(fresh()),source));
test('source and newly derived reference datasets have no validation issues',()=>assert.deepEqual(M.validate(fresh(),refs),[]));
test('all 15 original logos exist with exact filename case',()=>{assert.equal(refs.lighting_vendors.vendors.length,15);const files=fs.readdirSync(`${root}images/vendor`);for(const v of refs.lighting_vendors.vendors)assert(files.includes(v.logo.split('/').at(-1)));});
test('manifest retains the exact production schema and path',()=>{assert.deepEqual(Object.keys(refs.manifest),['catalogues']);for(const r of refs.manifest.catalogues)assert.deepEqual(Object.keys(r),['vendor','file']);assert.equal(refs.manifest.catalogues[0].file,'json/cable/christie_lites_cable.json');});
test('new vendors use supported metadata and no invented runtime fields',()=>assert.deepEqual(M.runtimeJSON(M.newProject('Test Vendor')),{vendor:{name:'Test Vendor',lengthUnit:'m'},cables:{}}));
test('positive decimal lengths and separated paste',()=>assert.deepEqual(M.parseLengths('1, 2.5; .75\n10').values,[1,2.5,.75,10]));
test('invalid length paste is rejected without partial output',()=>{for(const text of ['0','-1','1,bad,3','Infinity','1e3','3ft','NaN'])assert.throws(()=>M.parseLengths(text));});
test('duplicate length detection and merge/replace/cancel',()=>{assert.deepEqual(M.parseLengths('1,1,2').duplicates,[1]);assert.deepEqual(M.combineLengths([1,2],[2,3],'merge'),[1,2,3]);assert.deepEqual(M.combineLengths([1],[2],'replace'),[2]);assert.deepEqual(M.combineLengths([1],[2],'cancel'),[1]);});
test('alias selected wording stays in cable output with reference defaults',()=>{const r=M.referenceMatch(refs.cable_types.items,'DMX 5-pin'),c=M.defaultCable(r,'DMX 5-pin');assert.equal(c.name,'DMX 5-pin');assert.deepEqual(c.connectors,{male:'XLR-5',female:'XLR-5'});M.setCell(c,'start','Custom male');assert.equal(c.connectors.male,'Custom male');});
test('bidirectional endpoints preserve authoritative end key',()=>{const row=M.clone(source.cables.Data[5]);M.setCell(row,'start','Custom RJ45');assert.deepEqual(row.connectors,{end:'Custom RJ45'});assert.equal(M.getCell(row,'end'),'Custom RJ45');});
test('unknown stock, vendor, connector and cable fields survive edits',()=>{const data=M.clone(source);data.extra={a:[1,{x:'y'}]};data.vendor.version='v7.2';data.vendor.custom=false;data.cables.Data[0].colour='black';data.cables.Data[0].connectors.custom='keep';const p=M.projectFromStock(data);M.setCell(p.stock.cables.Data[0],'name','alias');const output=M.runtimeJSON(p);assert.deepEqual(output.extra,data.extra);assert.equal(output.vendor.version,'v7.2');assert.equal(output.cables.Data[0].connectors.custom,'keep');assert.equal(output.cables.Data[0].colour,'black');});
test('schema validation preserves partially invalid rows without crashing',()=>{const p=fresh();p.stock.vendor.name=12;p.stock.cables.Data[0].lengths=['bad'];assert(M.validate(p).filter(i=>i.level==='error').length>=2);assert.deepEqual(M.runtimeJSON(p).cables.Data[0].lengths,['bad']);});
test('unsupported root structures rejected before import',()=>{for(const v of [{},{vendor:{},cables:[]},{vendor:{},cables:{Data:[null]}}])assert.throws(()=>M.projectFromStock(v));});
test('prototype pollution keys rejected',()=>assert.throws(()=>M.parseJSON('{"__proto__":{"polluted":true}}')));
test('changes follow stable row IDs after deletions',()=>{const p=fresh();p.stock.cables.Data.splice(0,1);p.rowIds.Data.splice(0,1);assert.deepEqual(M.changes(p).map(x=>x.kind),['removed']);assert.equal(M.baselineRow(p,'Data',0).name,'XLR-4');});
test('new and changed cells compare to imported baseline',()=>{const p=fresh();p.stock.cables.Data[0].lengths.push(999);p.stock.cables.Data.push(M.defaultCable());p.rowIds.Data.push(M.uid());assert.deepEqual(M.changes(p).map(x=>x.kind),['modified','added']);});
test('identical stock JSON import preview reports zero changes without mutating either project',()=>{
  const current=fresh(),incoming=fresh(),before=M.clone({current,incoming});
  assert.deepEqual(M.stockImportChanges(incoming,current),[]);
  assert.deepEqual({current,incoming},before);
  assert.deepEqual(M.changes(incoming),[]);
});
test('stock JSON import preview reports changed lengths and unknown fields as modifications',()=>{
  const current=fresh(),stock=M.clone(source);stock.cables.Data[0].lengths.push(999);stock.cables.Data[1].custom={colour:'blue'};
  assert.deepEqual(M.stockImportChanges(M.projectFromStock(stock,current.filename),current),[
    {category:'Data',kind:'modified',name:'XLR-3'},{category:'Data',kind:'modified',name:'XLR-4'}]);
});
test('stock JSON import preview separates insertions, removals and row order',()=>{
  const current=fresh(),stock=M.clone(source);stock.cables.Data.splice(1,1);stock.cables.Data.reverse();stock.cables.Data.splice(2,0,{name:'New cable',lengths:[3]});
  assert.deepEqual(M.stockImportChanges(M.projectFromStock(stock,current.filename),current),[
    {category:'Data',kind:'modified',name:'Row order'},{category:'Data',kind:'added',name:'New cable'},{category:'Data',kind:'removed',name:'XLR-4'}]);
});
test('stock JSON preview matches duplicate names by full content before changed rows',()=>{
  const current=M.projectFromStock({vendor:{name:'Test',lengthUnit:'m'},cables:{Data:[{name:'Same',lengths:[1]},{name:'Same',lengths:[2]}]}});
  const incoming=M.projectFromStock({vendor:current.stock.vendor,cables:{Data:[{name:'Same',lengths:[3]},{name:'Same',lengths:[2]}]}});
  assert.deepEqual(M.stockImportChanges(incoming,current),[{category:'Data',kind:'modified',name:'Same'}]);
});
test('stock JSON preview handles identical duplicates one-to-one and leaves ambiguous matches explicit',()=>{
  const current=M.projectFromStock({vendor:{name:'Test',lengthUnit:'m'},cables:{Data:[{name:'Same',lengths:[1]},{name:'Same',lengths:[1]}]}});
  assert.deepEqual(M.stockImportChanges(M.projectFromStock(current.stock),current),[]);
  const incoming=M.projectFromStock({vendor:current.stock.vendor,cables:{Data:[{name:'Same',lengths:[2]},{name:'Same',lengths:[3]}]}});
  assert.deepEqual(M.stockImportChanges(incoming,current).map(x=>x.kind),['added','added','removed','removed']);
});
test('stock JSON preview keeps renames, category changes and generator data removal visible',()=>{
  const current=fresh();current.vendorVersion='v2';current.looms=[{id:'loom',name:'Saved loom',lengths:[30],components:[]}];
  const stock=M.clone(source);stock.cables.Data[0].name='Renamed';stock.cables.Empty=[];delete stock.cables.Motor;
  const result=M.stockImportChanges(M.projectFromStock(stock,current.filename),current);
  for(const expected of [
    {category:'Vendor',kind:'modified',name:'Generator vendor version'},
    {category:'Data',kind:'added',name:'Renamed'},{category:'Data',kind:'removed',name:'XLR-3'},
    {category:'Motor',kind:'removed',name:'Category'},{category:'Empty',kind:'added',name:'Category'},
    {category:'Stock / Pre-Made Looms',kind:'removed',name:'Saved loom'}])assert(result.some(x=>M.same(x,expected)));
});
test('stock JSON preview compares the current draft, including vendor/root metadata, not its import baseline',()=>{
  const current=fresh();current.stock.cables.Data[0].lengths.push(999);
  const incoming=M.projectFromStock(current.stock,current.filename);
  assert.deepEqual(M.stockImportChanges(incoming,current),[]);
  incoming.stock.vendor.custom='changed';incoming.stock.extra={a:1};
  assert.deepEqual(M.stockImportChanges(incoming,current).map(x=>x.name),['Vendor metadata','Root custom fields']);
});
test('semantic equality ignores object field order, but preserves array order',()=>{assert(M.same({x:1,y:2},{y:2,x:1}));assert(!M.same([1,2],[2,1]));});
test('vendor version increment independent of app/runtime version',()=>{assert.equal(M.incrementVersion('v2',false),'v2.1');assert.equal(M.incrementVersion('v2.9',true),'v3');assert.throws(()=>M.incrementVersion('bad',true));const p=fresh();p.vendorVersion='v3';assert(!('version' in M.runtimeJSON(p).vendor));});
test('runtime exports approved loom fields while excluding editor data and vendor version',()=>{const p=fresh();p.looms=[{id:'loom-test',name:'Fixture test',lengths:[30],components:[]}];p.vendorVersion='v4';assert.deepEqual(M.runtimeJSON(p),{...source,cables:{...source.cables,[M.LOOM_CATEGORY]:[{id:'loom-test',name:'Fixture test',lengths:[30],cables:[]}]}});assert(M.validate(p).some(i=>i.message.includes('needs components')));});
test('project backup restores imported baseline and looms',()=>{const p=fresh();p.looms.push({id:'test-loom',name:'Test',lengths:[30],description:'',components:[{id:'comp-1',type:'DMX 5-pin',count:2,connectors:{male:'XLR-5',female:'XLR-5'},lengths:[]}]});const restored=M.restoreProject(M.parseJSON(JSON.stringify(p)));assert.deepEqual(restored,p);});
test('Excel full binary round trip preserves authoritative JSON and no false changes',()=>{const p=fresh(),r=roundtrip(p).project;assert.deepEqual(r.stock,p.stock);assert.deepEqual(r.rowIds,p.rowIds);assert.deepEqual(M.changes(r,M.snapshot(p)),[]);});
test('Excel aliases, overrides, custom nested data, version and composite looms round trip',()=>{
  const p=fresh();p.stock.extra={some:['nested',{unicode:'ø'}]};p.stock.vendor.version='v8';p.stock.cables.Data[0].custom={deep:[true,7]};p.stock.cables.Data[0].name='DMX 3-pin';p.stock.cables.Data[0].connectors.male='Vendor plug';p.vendorVersion='v2.1';p.looms=[{id:'test-loom',name:'Test loom',lengths:[30,40.5],description:'Internal generated fixture',components:[{id:'a',type:'Socapex',count:4,connectors:{male:'Socapex 19-Pin',female:'Override'},lengths:[],custom:{a:1}},{id:'b',type:'DMX 5-pin',count:2,connectors:{male:'XLR-5',female:'XLR-5'},lengths:[31]}]}];
  const r=roundtrip(p).project;assert.deepEqual(r.stock,p.stock);assert.deepEqual(r.looms,p.looms);assert.equal(r.vendorVersion,p.vendorVersion);
});
test('Excel chunked metadata preserves more than 32767 characters',()=>{const p=fresh();p.stock.note='x'.repeat(75000);assert.equal(roundtrip(p).project.stock.note,p.stock.note);});
test('oversized per-row Excel cells are explicitly rejected',()=>{const p=fresh();p.stock.cables.Data[0].note='x'.repeat(35000);assert.throws(()=>toWorkbook(p,X),/32,767/);});
test('long and forbidden category names map losslessly through Excel',()=>{const p=fresh(),cat='A long/category:with[forbidden]*characters-and-more';p.stock.cables[cat]=[M.clone(p.stock.cables.Data[0])];p.rowIds[cat]=['test-long'];const book=toWorkbook(p,X);assert(book.SheetNames.every(n=>n.length<=31&&!/[\\/?*\[\]:]/.test(n)));assert.deepEqual(roundtrip(p).project.stock,p.stock);});
test('case-insensitive Excel sheet collisions are resolved',()=>{const used=new Set(['data']);assert.equal(sheetName('Data',used),'Data (2)');});
test('Excel endpoint edits keep unknown connector fields',()=>{const p=fresh();p.stock.cables.Data[0].connectors.extra='retain';const book=toWorkbook(p,X);book.Sheets.Data.D2={t:'s',v:'New plug'};const r=fromWorkbook(book,X,p).project;assert.equal(r.stock.cables.Data[0].connectors.male,'New plug');assert.equal(r.stock.cables.Data[0].connectors.extra,'retain');});
test('inconsistent bidirectional Excel endpoints reject whole import',()=>{const p=fresh(),book=toWorkbook(p,X);book.Sheets.Data.D7={t:'s',v:'Different'};assert.throws(()=>fromWorkbook(book,X,p),/must match/);});
test('direct connectors_json Excel edits are not overwritten by unchanged endpoint cells',()=>{const p=fresh(),book=toWorkbook(p,X);book.Sheets.Data.G2={t:'s',v:'{"male":"Changed","female":"XLR-3","custom":"kept"}'};const r=fromWorkbook(book,X,p).project;assert.equal(r.stock.cables.Data[0].connectors.male,'Changed');assert.equal(r.stock.cables.Data[0].connectors.custom,'kept');});
test('conflicting edits to both Excel connector representations are rejected',()=>{const p=fresh(),book=toWorkbook(p,X);book.Sheets.Data.G2={t:'s',v:'{"male":"One","female":"XLR-3"}'};book.Sheets.Data.D2={t:'s',v:'Two'};assert.throws(()=>fromWorkbook(book,X,p),/conflict/);});
test('Excel preserves unchanged partially invalid values and missing fields in explicit metadata',()=>{const p=fresh();p.stock.cables.Data[0].lengths=['invalid',0,4,4];p.stock.cables.Data[1].connectors=null;delete p.stock.cables.Data[2].name;assert.deepEqual(roundtrip(p).project.stock,p.stock);});
test('duplicate lengths entered in Excel are retained and flagged, not silently discarded',()=>{const p=fresh(),book=toWorkbook(p,X);book.Sheets.Data.F2={t:'s',v:'2, 2, 3'};const r=fromWorkbook(book,X,p).project;assert.deepEqual(r.stock.cables.Data[0].lengths,[2,2,3]);assert(M.validate(r).some(i=>i.message.startsWith('Duplicate lengths')));});
test('single category Excel replaces only its scope',()=>{const p=fresh(),r=roundtrip(p,{category:'Data'});r.project.stock.cables.Data.splice(0,1);r.project.rowIds.Data.splice(0,1);const result=replaceWorkbook(p,r.project,r.partial,r.categories);assert.equal(result.stock.cables.Data.length,p.stock.cables.Data.length-1);assert.deepEqual(result.stock.cables.Multi,p.stock.cables.Multi);assert.deepEqual(result.baseline,p.baseline);});
test('Excel merge keeps rows omitted by incoming workbook',()=>{const p=fresh(),incoming=M.clone(p);incoming.stock.cables.Data.splice(0,1);incoming.rowIds.Data.splice(0,1);incoming.stock.cables.Data[0].name='Changed';const r=M.mergeProjects(p,incoming);assert.equal(r.stock.cables.Data.length,p.stock.cables.Data.length);assert.equal(r.stock.cables.Data[1].name,'Changed');});
test('Excel formula cells are not evaluated or silently read',()=>{const p=fresh(),book=toWorkbook(p,X);book.Sheets.Data.B2={t:'s',v:'cached',f:'HYPERLINK("https://example.com")'};assert.throws(()=>fromWorkbook(book,X,p),/Formula found/);});
test('unmapped extra worksheets are not silently discarded',()=>{const p=fresh(),book=toWorkbook(p,X);X.utils.book_append_sheet(book,X.utils.aoa_to_sheet([['a'],['b']]),'Unmapped');assert.throws(()=>fromWorkbook(book,X,p),/not mapped/);});
test('blank template retains category columns and metadata',()=>{const p=fresh(),r=roundtrip(p,{blank:true});assert.equal(r.project.stock.vendor.name,p.stock.vendor.name);assert(Object.values(r.project.stock.cables).every(rows=>rows.length===0));});
test('rectangular Excel TSV supports quoted tabs, newlines and quotes',()=>{const rows=[['a','two\nlines','tab\tvalue'],['"quote"','5, 10','']];assert.deepEqual(parseTSV(toTSV(rows)),rows);assert.throws(()=>parseTSV('"broken'));});
test('grid parse validates numeric and JSON cells',()=>{assert.deepEqual(parseCell('1,2.5',{type:'lengths'}),[1,2.5]);assert.equal(parseCell('4',{type:'integer'}),4);assert.throws(()=>parseCell('0',{type:'integer'}));assert.throws(()=>parseCell('{broken',{type:'json'}));});
test('manifest path checks block traversal and external URLs',()=>{for(const path of ['../a.json','/a.json','https://host/a.json','json/../a.json','json/a.json?x=1'])assert.equal(M.relativePath(path),false);assert(M.relativePath('json/cable/christie_lites_cable.json'));});
test('Excel row reordering appears in change review',()=>{const p=fresh();p.stock.cables.Data.reverse();p.rowIds.Data.reverse();assert(M.changes(p).some(c=>c.name==='Row order'));});
test('merge never drops duplicate-named incoming rows',()=>{const p=M.newProject('Test'),incoming=M.projectFromStock({vendor:{name:'Test',lengthUnit:'m'},cables:{Data:[{name:'Same',lengths:[1]},{name:'Same',lengths:[2]}]}});assert.equal(M.mergeProjects(p,incoming).stock.cables.Data.length,2);});
test('manifest filename mismatch is reported without rewriting it',()=>{const p=fresh();p.filename='changed.json';assert(M.validate(p,refs).some(i=>i.message.includes('manifest expects')));assert.equal(p.filename,'changed.json');});
test('grid rejects duplicate lengths and non-object JSON cells atomically',()=>{assert.throws(()=>parseCell('1,1',{type:'lengths'}),/Duplicate/);assert.throws(()=>parseCell('[]',{type:'json'}),/JSON object/);});
test('non-finite JSON values are rejected instead of becoming null on export',()=>assert.throws(()=>M.parseJSON('{"length":1e400}'),/finite/));
test('all HTML script, stylesheet and documentation paths resolve locally',()=>{const html=fs.readFileSync(`${root}index.html`,'utf8');for(const match of html.matchAll(/(?:src|href)="([^"]+)"/g)){const path=match[1];if(!/^(?:[a-z]+:|#)/i.test(path))assert(fs.existsSync(`${root}${path}`),path);}for(const name of ['app','excel','grid','model','version']){const js=fs.readFileSync(`${root}js/${name}.js`,'utf8');for(const m of js.matchAll(/from '(.+?)'/g))assert(fs.existsSync(`${root}js/${m[1]}`),m[1]);}});
test('vendor manifest sync includes every vendor and preserves original entries',()=>{
  const r=M.clone(refs),first=M.clone(r.manifest.catalogues[0]);M.syncVendorManifest(r);
  assert.equal(r.manifest.catalogues.length,15);assert.deepEqual(r.manifest.catalogues[0],first);
  assert.equal(r.manifest.catalogues.find(x=>x.vendor==='Adlib').file,'json/cable/adlib_cable.json');
  const once=M.clone(r.manifest);M.syncVendorManifest(r);assert.deepEqual(r.manifest,once);
  assert(r.manifest.catalogues.every(x=>Object.keys(x).join(',')==='vendor,file'));
});
test('generated manifest paths handle collisions and never overwrite existing paths',()=>{
  const r={lighting_vendors:{vendors:[{name:'A B'},{name:'A-B'},{name:'Existing'},{name:''}]},manifest:{catalogues:[{vendor:'Existing',file:'json/custom.json'}]}};
  M.syncVendorManifest(r);assert.deepEqual(r.manifest.catalogues.map(x=>x.file),['json/custom.json','json/cable/a_b_cable.json','json/cable/a_b_2_cable.json']);
});
test('known category and alias seed associated cable types, custom category stays empty',()=>{
  const r=M.clone(refs);r.categories.items[0].aliases.push('Control');
  const seeded=M.categoryCables('Control',r);assert.equal(seeded.length,9);
  assert(seeded.every(x=>x.row.lengths.length===0));assert.deepEqual(seeded[0].row.connectors,source.cables.Data[0].connectors);
  seeded[0].row.connectors.male='Changed';assert.equal(r.cable_types.items[0].connectors.male,'XLR-3');
  assert.deepEqual(M.categoryCables('Unlisted',r),[]);
});
test('adaptor marker is generator-only, tracked in changes and restored in backups',()=>{
  const p=fresh();M.setCableAdaptor(p,'Data',0,true);assert(M.isCableAdaptor(p,'Data',0));
  assert.deepEqual(M.runtimeJSON(p),source);assert.equal(M.changes(p)[0].kind,'modified');
  assert(M.isCableAdaptor(M.restoreProject(JSON.parse(JSON.stringify(p))),'Data',0));
  M.setCableAdaptor(p,'Data',0,false);assert.deepEqual(M.changes(p),[]);
});
test('adaptor marker survives full and partial Excel replacement and merge',()=>{
  const p=fresh();M.setCableAdaptor(p,'Data',0,true);
  const full=roundtrip(p);assert(M.isCableAdaptor(full.project,'Data',0));assert.deepEqual(full.project.stock,source);
  const partial=roundtrip(p,{category:'Data'}),replaced=replaceWorkbook(fresh(),partial.project,true,partial.categories);
  assert(M.isCableAdaptor(replaced,'Data',0));assert(M.isCableAdaptor(M.mergeProjects(fresh(),full.project),'Data',0));
});
test('legacy Excel without adaptor column remains importable',()=>{
  const p=fresh(),book=toWorkbook(p,X);delete book.Sheets.Data.I1;
  for(let i=2;i<=10;i++)delete book.Sheets.Data[`I${i}`];
  const result=fromWorkbook(book,X,p);assert.deepEqual(result.project.stock,source);
});
test('adaptor Excel input rejects unknown values',()=>{const p=fresh(),book=toWorkbook(p,X);book.Sheets.Data.I2={t:'s',v:'maybe'};assert.throws(()=>fromWorkbook(book,X,p),/Adaptor/);});
const palette=JSON.parse(fs.readFileSync(`${root}reference/colour_options.json`));
test('colours resolve only to supplied Lampy hex values and no-colour aliases',()=>{
  assert.equal(M.resolveColour('Red',palette),'#FF0000');assert.equal(M.resolveColour('Cyan',palette),'#008EE6');assert.equal(M.resolveColour('Clear',palette),'');
  assert.equal(M.resolveColour('#9c54ff',palette),'#9C54FF');
  assert.throws(()=>M.resolveColour('G',palette),/Ambiguous/);assert.throws(()=>M.resolveColour('#123456',palette),/Choose a colour/);
});
test('length colours separate vendors and units, validate duplicates and all three fields',()=>{
  const row={vendor:'Test',unit:'m',length:5,colour1:'#FF0000',colour2:'#FFFFFF',colour3:''};
  assert.deepEqual(M.validateLengthColours({items:[row,{...row,unit:'ft'},{...row,vendor:'Other'}]},palette),[]);
  const problems=M.validateLengthColours({items:[row,{...row,colour3:'Unknown'}]},palette);
  assert(problems.some(x=>x.field==='length'));assert(problems.some(x=>x.field==='colour3'));
  assert(M.validateLengthColours({items:[{...row,length:-1}]},palette).some(x=>x.field==='length'));
});
test('table parsers reject invalid adaptor, positive length and colour values before edits',()=>{
  assert.equal(parseCell('yes',{type:'boolean'}),true);assert.equal(parseCell('no',{type:'boolean'}),false);assert.throws(()=>parseCell('maybe',{type:'boolean'}));
  assert.equal(parseCell('12.5',{type:'positive'}),12.5);assert.throws(()=>parseCell('0',{type:'positive'}));
  assert.throws(()=>parseCell('B',{parse:v=>M.resolveColour(v,palette)}),/Ambiguous/);
});

// Exercise commit/navigation without browser APIs, including table rebuilds.
function tabGrid(){const g=Object.create(Grid.prototype);Object.assign(g,{selection:{r:0,c:0},ids:[0,1],o:{columns:[{key:'name'},{key:'length'}]},host:{isConnected:true},editor:{value:'new',focus(){this.focused=true;}},editorOriginal:'old',select(r,c){this.selection={r,c};},commitEditor(){this.committed=true;return true;}});return g;}
test('Tab commits before moving right and Shift+Tab wraps to previous row',()=>{const g=tabGrid();assert.equal(g.moveTab(false,true),true);assert.equal(g.committed,true);assert.deepEqual(g.selection,{r:0,c:1});g.moveTab();assert.deepEqual(g.selection,{r:1,c:0});g.moveTab(true);assert.deepEqual(g.selection,{r:0,c:1});});
test('Invalid Tab entry retains selection, entered text and editor focus',()=>{const g=tabGrid();g.commitEditor=()=>false;assert.equal(g.moveTab(false,true),false);assert.deepEqual(g.selection,{r:0,c:0});assert.equal(g.editor.value,'new');assert.equal(g.editor.focused,true);});
test('Tab follows rebuilt table columns and sorted row position',()=>{const g=tabGrid(),next=tabGrid();next.ids=[1,0];next.o.columns=[{key:'name'},{key:'adaptor'},{key:'length'}];g.commitEditor=()=>{g.host.isConnected=false;return true;};g.o.current=()=>next;g.moveTab(false,true);assert.deepEqual(next.selection,{r:1,c:1});});
test('Tab avoids unchanged commits and stays at outer table boundaries',()=>{const g=tabGrid();g.editor.value=g.editorOriginal;g.moveTab(true,true);assert.equal(g.committed,undefined);assert.deepEqual(g.selection,{r:0,c:0});g.selection={r:1,c:1};g.moveTab();assert.deepEqual(g.selection,{r:1,c:1});});

test('Table column policy hides every JSON column and adaptor endpoints until needed',()=>{
 const columns=[{key:'name'},{key:'start'},{key:'end'},{key:'direction'},{key:'connectors',type:'json'},{key:'custom',type:'json'}];
 assert.deepEqual(M.visibleTableColumns(columns,false).map(c=>c.key),['name']);
 assert.deepEqual(M.visibleTableColumns(columns,true).map(c=>c.key),['name','start','end','direction']);
 assert.equal(columns.length,6);
});
test('Cable type sheets include reference, custom and uncategorised entries without mutation',()=>{
 const r={categories:{items:[{name:'Data'},{name:'Mains'}]},cable_types:{items:[{category:'Custom',name:'A'},{category:'Data',name:'B'},{name:'C'}]}};
 const before=M.clone(r);assert.deepEqual(M.cableTypeSheets(r),['Data','Mains','Custom','']);
 assert.equal(M.cableTypeRows(r.cable_types.items,'Data')[0],r.cable_types.items[1]);
 assert.equal(M.cableTypeRows(r.cable_types.items,'')[0].name,'C');assert.deepEqual(r,before);
});
test('Settings controller scopes additions, multi-cell category moves and deletions to the selected sheet',()=>{
 const element=()=>({append(){},before(){},replaceChildren(){},setAttribute(){},replaceWith(){}});
 let captured;
 const context=vm.createContext({...M,source:M.clone(source),APP_VERSION:'test',document:{createElement:element,querySelector:element},Grid:class{constructor(host,o){captured=o;}},setTimeout,clearTimeout});
 const app=fs.readFileSync(`${root}js/app.js`,'utf8').replace(/^import .*;$/gm,'').replace(/start\(\);\s*$/,'');
 vm.runInContext(app,context);
 vm.runInContext(`refs={categories:{items:[{name:'Data'},{name:'Mains'}]},cable_types:{items:[{id:'a',name:'A',category:'Data',aliases:[],connectors:{end:'preserved'}},{id:'b',name:'B',category:'Mains',aliases:[]}]}};referenceBaseline=clone(refs);settingsTab='cable_types';cableTypesSheet='Data';heading=()=>{};change=fn=>fn();confirmAction=(title,text,fn)=>fn();renderSettings();`,context);
 assert.equal(captured.rows().length,1);captured.add();assert.equal(captured.rows().length,2);assert.equal(captured.rows()[1].category,'Data');
 captured.apply([{id:0,col:{key:'category'},value:'Mains'},{id:0,col:{key:'name'},value:'Moved A'}],false);
 const after=JSON.parse(vm.runInContext('JSON.stringify(refs.cable_types.items)',context));
 assert.equal(after[0].name,'Moved A');assert.equal(after[0].category,'Mains');assert.deepEqual(after[0].connectors,{end:'preserved'});assert.equal(after[1].name,'B');
 captured.remove([0]);assert.equal(captured.rows().length,0);assert.equal(vm.runInContext('refs.cable_types.items.length',context),2);
 vm.runInContext("cableTypesSheet='Mains';renderSettings();",context);assert.equal(captured.rows().length,2);
 assert.equal(app.includes('Load supplied Christie example'),false);
 vm.runInContext("cableTypesSheet='Data';renderSettings();",context);
 captured.apply([{id:0,col:{key:'name'},value:'New one'},{id:1,col:{key:'name'},value:'New two'}],true);
 assert.equal(captured.rows().length,2);assert.equal(captured.rows()[1].category,'Data');
 assert.equal(vm.runInContext('refs.cable_types.items.length',context),4);
 vm.runInContext("project=projectFromStock(source,'example.json');renderCategory('Data');",context);
 assert.equal(captured.columns.some(c=>c.key==='start'),false);assert.equal(captured.columns.some(c=>c.type==='json'),false);
 vm.runInContext("setCableAdaptor(project,'Data',0,true);renderCategory('Data');",context);
 assert.equal(captured.columns.some(c=>c.key==='start'),true);assert.equal(captured.columns.some(c=>c.type==='json'),false);
 assert.equal(captured.get(captured.rows()[1],'start'),'');assert.equal(captured.readOnly(1,'start'),true);assert.equal(captured.readOnly(0,'start'),false);
 assert.deepEqual(JSON.parse(vm.runInContext('JSON.stringify(runtimeJSON(project))',context)),source);
});

test('vendor version entry adds v once and preserves minor version digits',()=>{for(const [input,expected]of [['2','v2'],['2.1','v2.1'],['2.10','v2.10'],['v2.1','v2.1'],[' V3 ','v3'],['',''],['  ',''],[0,'v0']])assert.equal(M.normaliseVendorVersion(input),expected);assert.equal(M.incrementVersion(M.normaliseVendorVersion('2.1'),false),'v2.2');});
test('invalid version text is not silently repaired into a different version',()=>{for(const input of ['bad','-2','2..1','2.1.3','vv2'])assert.equal(M.normaliseVendorVersion(input),input);});

test('recognised cable names and aliases inherit missing connector defaults without replacing overrides',()=>{const entries=[{name:'Known',aliases:['Alias'],direction:'male-female',connectors:{male:'Plug',female:'Socket'}}];const row={name:' Alias ',direction:'male-female',connectors:{male:'Custom',female:''},lengths:[]};assert.equal(M.inheritCableConnectors(row,entries),true);assert.deepEqual(row.connectors,{male:'Custom',female:'Socket'});assert.equal(M.inheritCableConnectors(row,entries),false);assert.equal(M.cableNeedsConnectorInputs(row,entries),false);assert.equal(M.cableNeedsConnectorInputs({...row,name:'Custom'},entries),true);});
test('empty recognised bidirectional cables inherit direction and end; incompatible overrides remain editable',()=>{const entries=[{name:'Known',direction:'bidirectional',connectors:{end:'RJ45'}}];const row=M.defaultCable();row.name='Known';assert.equal(M.inheritCableConnectors(row,entries),true);assert.equal(row.direction,'bidirectional');assert.equal(row.connectors.end,'RJ45');const custom={name:'Known',direction:'male-female',connectors:{male:'Override',female:''}};assert.equal(M.inheritCableConnectors(custom,entries),false);assert.equal(M.cableNeedsConnectorInputs(custom,entries),true);});
test('custom cable normal connector inputs fix validation without adaptor flag or runtime markers',()=>{const p=fresh();p.stock.cables.Custom=[M.defaultCable(null,'Custom cable')];p.rowIds.Custom=['custom'];const row=p.stock.cables.Custom[0];row.lengths=[5];M.setCell(row,'start','Custom plug');M.setCell(row,'end','Custom socket');assert.equal(M.validate(p).filter(x=>x.category==='Custom'&&x.level==='error').length,0);assert.equal(M.isCableAdaptor(p,'Custom',0),false);assert.deepEqual(M.runtimeJSON(p).cables.Custom[0].connectors,{male:'Custom plug',female:'Custom socket'});});

test('bidirectional inherited end is visible despite old empty male/female keys',()=>{const row={name:'Ethernet',direction:'bidirectional',connectors:{male:'',female:'',end:'RJ45'}};assert.equal(M.getCell(row,'start'),'RJ45');assert.equal(M.getCell(row,'end'),'RJ45');M.setCell(row,'end','EtherCON');assert.equal(M.getCell(row,'end'),'EtherCON');});

test('validation and export preserve missing connectors without inventing cable-name fallbacks',()=>{
 const p=fresh();p.stock.cables.Custom=[M.defaultCable(null,'Review cable'),{name:'Bad',direction:'male-female',connectors:42,lengths:[]}];const before=M.clone(p);
 assert(M.validate(p).some(i=>i.category==='Custom'&&i.field==='start'));M.runtimeJSON(p);assert.deepEqual(p,before);
});
const suppliedReviewCable=name=>({...M.defaultCable(null,name),connectors:{male:name,female:name},lengths:[5]});
test('review groups unknown connector ends and approval corrects all uses without duplicate references',()=>{
 const p=fresh(),r=M.clone(refs);p.stock.cables.Custom=[suppliedReviewCable('Review cable'),suppliedReviewCable('review cable')];
 const review=M.connectorReviews(p,r).find(x=>x.name==='Review cable');assert.equal(review.usages.length,4);
 const count=r.connector_types.items.length;assert.throws(()=>M.approveConnector(p,r,'Review cable','  '),/Enter/);assert.equal(r.connector_types.items.length,count);
 M.approveConnector(p,r,'Review cable','Approved connector');assert.equal(r.connector_types.items.length,count+1);assert(!M.connectorReviews(p,r).some(x=>x.name==='Approved connector'));
 assert.equal(p.stock.cables.Custom[1].connectors.female,'Approved connector');assert.throws(()=>M.approveConnector(p,r,'Review cable','Again'),/no longer/);
 p.stock.cables.Custom.push(suppliedReviewCable('Another'));M.approveConnector(p,r,'Another','approved connector');assert.equal(r.connector_types.items.length,count+1);
});
test('pending connector review survives stock JSON and project/Excel round trips without runtime metadata',()=>{
 const p=fresh(),r=M.clone(refs);p.stock.cables.Custom=[suppliedReviewCable('Review cable')];p.rowIds.Custom=['test-review'];
 const output=M.runtimeJSON(p);assert.deepEqual(Object.keys(output).sort(),Object.keys(source).sort());
 for(const restored of [M.projectFromStock(output),M.restoreProject(M.clone(p)),fromWorkbook(toWorkbook(p,X),X,p).project])assert(M.connectorReviews(restored,r).some(x=>x.name==='Review cable'));
 assert.equal(M.connectorReviews(fresh(),r).length,0);
});

test('connector sheets infer legacy categories and aliases without changing source records',()=>{
 const r={categories:{items:[{name:'Data'},{name:'Mains'}]},cable_types:{items:[{category:'Data',connectors:{male:'alias'}},{category:'Multi',connectors:{end:'Shared'}}]},connector_types:{items:[{name:'Shared',aliases:['Alias']},{name:'Unmatched'},{name:'Explicit',category:'Custom'},{name:'Shared',category:''}]}};
 const before=M.clone(r);assert.deepEqual(M.connectorTypeSheets(r),['Data','Mains','Multi','','Custom']);
 assert.deepEqual(M.connectorTypeRows(r.connector_types.items,'Data',r).map(x=>x.name),['Shared']);
 assert.deepEqual(M.connectorTypeRows(r.connector_types.items,'Multi',r).map(x=>x.name),['Shared']);
 assert.equal(M.connectorTypeRows(r.connector_types.items,'',r).length,2);assert.deepEqual(r,before);
});
test('connector controller scopes additions, category moves, multi-row paste and deletion',()=>{
 const element=()=>({append(){},before(){},replaceChildren(){},setAttribute(){},replaceWith(){}});let grid;
 const c=vm.createContext({...M,APP_VERSION:'test',document:{createElement:element,querySelector:element},Grid:class{constructor(host,o){grid=o;}},setTimeout,clearTimeout});
 vm.runInContext(fs.readFileSync(`${root}js/app.js`,'utf8').replace(/^import .*;$/gm,'').replace(/start\(\);\s*$/,''),c);
 vm.runInContext(`refs={categories:{items:[{name:'Data'},{name:'Mains'}]},cable_types:{items:[{category:'Data',connectors:{end:'Legacy'}}]},connector_types:{items:[{id:'a',name:'Legacy',aliases:[]},{id:'b',name:'Power',category:'Mains',aliases:[]}]}};referenceBaseline=clone(refs);settingsTab='connector_types';connectorTypesSheet='Data';heading=()=>{};change=fn=>fn();confirmAction=(title,text,fn)=>fn();renderSettings();`,c);
 assert.equal(grid.rows().length,1);grid.add();assert.equal(grid.rows()[1].category,'Data');
 grid.apply([{id:0,col:{key:'category'},value:'Mains'},{id:0,col:{key:'name'},value:'Moved'}],false);
 assert.equal(grid.rows().length,1);grid.remove([0]);assert.equal(grid.rows().length,0);
 grid.apply([{id:0,col:{key:'name'},value:'New A'},{id:1,col:{key:'name'},value:'New B'}],true);
 assert.equal(grid.rows().length,2);assert.equal(grid.rows()[1].category,'Data');
 vm.runInContext("connectorTypesSheet='Mains';renderSettings();",c);assert.equal(grid.rows().length,2);assert.equal(grid.rows()[0].name,'Moved');assert.equal(grid.rows()[1].name,'Power');
});
test('approved connectors inherit one usage category without adding category to stock JSON',()=>{
 const p=fresh(),r=M.clone(refs);p.stock.cables.Test=[suppliedReviewCable('Unlisted')];M.approveConnector(p,r,'Unlisted','Approved');
 assert.equal(r.connector_types.items.at(-1).category,'Test');assert.equal(p.stock.cables.Test[0].category,undefined);
});

test('new projects start at v1 with a matching baseline and retain it in project and Excel backups',()=>{
 for(const name of ['', 'New vendor']){
  const p=M.newProject(name);assert.equal(p.vendorVersion,'v1');assert.equal(p.baseline.vendorVersion,'v1');assert.deepEqual(M.changes(p),[]);
  assert.equal(M.restoreProject(M.clone(p)).vendorVersion,'v1');assert.equal(roundtrip(p).project.vendorVersion,'v1');
  assert.deepEqual(M.runtimeJSON(p),{vendor:{name,lengthUnit:'m'},cables:{}});
 }
});
test('new-project version default does not overwrite saved versions or invent an imported stock version',()=>{
 for(const version of ['', 'v2.1']){const p=M.newProject('Existing');p.vendorVersion=version;assert.equal(M.restoreProject(M.clone(p)).vendorVersion,version);assert.equal(roundtrip(p).project.vendorVersion,version);}
 assert.equal(fresh().vendorVersion,'');
});

test('handoff display overrides old label preferences without changing units or values',()=>{
 const p=fresh(),stock=M.runtimeJSON(p);
 for(const [unit,labels] of Object.entries(M.LENGTH_DISPLAYS)){
  p.stock.vendor.lengthUnit=unit;
  for(const label of labels){p.lengthDisplay={[unit]:label};assert.equal(M.lengthUnitLabel(p),unit==='ft'?"'":'m');assert.equal(M.formatLength(12.5,p),unit==='ft'?"12.5'":'12.5m');assert.equal(M.formatLength('',p),'');assert.equal(M.runtimeJSON(p).vendor.lengthUnit,unit);assert.deepEqual(M.runtimeJSON(p).cables,stock.cables);assert.equal(M.runtimeJSON(p).lengthDisplay,undefined);}
 }
 delete p.lengthDisplay;assert.equal(M.lengthUnitLabel(p),"'");
});
test('length display choices survive project and Excel backups while legacy projects stay unchanged',()=>{
 const p=fresh();p.lengthDisplay={m:'Meter',ft:"'"};
 assert.deepEqual(M.restoreProject(M.clone(p)).lengthDisplay,p.lengthDisplay);
 const r=roundtrip(p).project;assert.deepEqual(r.lengthDisplay,p.lengthDisplay);assert.deepEqual(M.runtimeJSON(r),M.runtimeJSON(p));
 const legacy=fresh();assert.deepEqual(M.restoreProject(M.clone(legacy)),legacy);assert.equal(roundtrip(legacy).project.lengthDisplay,undefined);
});
test('full workbook replacement and merge use incoming display choices; partial imports keep current choices',()=>{
 const current=fresh();current.lengthDisplay={m:'Meter',ft:'Feet'};
 const incoming=roundtrip(fresh()).project;incoming.lengthDisplay={m:'m',ft:"'"};
 assert.deepEqual(replaceWorkbook(current,incoming,false,[]).lengthDisplay,incoming.lengthDisplay);
 assert.deepEqual(M.mergeProjects(current,incoming).lengthDisplay,incoming.lengthDisplay);
 assert.deepEqual(replaceWorkbook(current,incoming,true,[]).lengthDisplay,current.lengthDisplay);
 assert.deepEqual(M.mergeProjects(current,incoming,true).lengthDisplay,current.lengthDisplay);
 const old=fresh();assert.equal(M.mergeProjects(current,old).lengthDisplay,undefined);
});
test('unsupported length display choices are rejected before restoring a project',()=>{
 for(const value of [null,[],{m:'Feet'},{ft:'Meter'},{yards:'yd'}]){const p=fresh();p.lengthDisplay=value;assert.throws(()=>M.restoreProject(p),/Invalid length display/);}
});

test('category deletion removes only its rows, keys and adaptor markers and preserves review baseline',()=>{
 const p=fresh();M.setCableAdaptor(p,'Data',0,true);M.setCableAdaptor(p,'Multi',0,true);p.baseline=M.snapshot(p);
 const before=M.clone(p),dataId=p.rowIds.Data[0],multiId=p.rowIds.Multi[0];
 M.removeProjectCategory(p,'Data');
 assert.equal(Object.hasOwn(p.stock.cables,'Data'),false);assert.equal(Object.hasOwn(p.rowIds,'Data'),false);assert.equal(p.adaptors[dataId],undefined);assert.equal(p.adaptors[multiId],true);
 assert.deepEqual(p.stock.cables.Multi,before.stock.cables.Multi);assert.deepEqual(p.baseline,before.baseline);
 assert(M.changes(p).some(c=>c.category==='Data'&&c.name==='Category'&&c.kind==='removed'));
 assert.deepEqual(M.restoreProject(M.parseJSON(JSON.stringify(p))),p);
 assert.deepEqual(M.runtimeJSON(roundtrip(p).project),M.runtimeJSON(p));
 const after=M.clone(p);M.removeProjectCategory(p,'Missing');assert.deepEqual(p,after);
});
test('deleting the project loom tab removes its export category without affecting other stock',()=>{
 const p=M.projectFromStock({vendor:{name:'Test',lengthUnit:'m'},cables:{Data:[]},looms:[{id:'l',name:'Test loom',lengths:[10],cables:[{cableType:'XLR-5',quantity:2}]}]});p.loomTab=true;
 const before=M.clone(p);M.removeProjectCategory(p,'Stock / Pre-Made Looms',{looms:true});
 assert.deepEqual(p.looms,[]);assert.equal(p.loomTab,false);assert.deepEqual(p.stock,before.stock);assert.deepEqual(p.baseline,before.baseline);
 assert.equal(M.runtimeJSON(p).cables[M.LOOM_CATEGORY],undefined);assert(M.changes(p).some(c=>c.kind==='removed'&&c.name==='Test loom'));
 assert.deepEqual(M.runtimeJSON(roundtrip(p).project),M.runtimeJSON(p));assert.deepEqual(M.restoreProject(M.clone(p)),p);
});

test('supplied reference looms load into stock with independent IDs, quantities and matching lengths',()=>{
 const p=newProjectFixture('ft'),before=M.clone(refs);
 const supplied=refs.cable_types.items.filter(r=>M.isLoomCategory(r.category,refs));assert(supplied.length>0);
 const categories=[...new Set(supplied.map(r=>r.category))];
 for(const category of categories){const plan=M.referenceLoomsForProject(p,refs,category);assert(plan.looms.length>0);assert.equal(plan.mismatches.length,0);M.addReferenceLooms(p,plan);}
 assert.equal(p.looms.length,supplied.length);p.looms.forEach((l,i)=>{assert.notEqual(l.id,supplied[i].id);assert.equal(l.referenceId,supplied[i].id);assert.deepEqual(l.lengths,supplied[i].lengths);assert.deepEqual(l.components.map(c=>[c.type,c.count]),supplied[i].components.map(c=>[c.type,c.count]));});
 assert.deepEqual(refs,before);assert.deepEqual(M.restoreProject(M.clone(p)),p);assert.deepEqual(roundtrip(p).project.looms,p.looms);
 p.looms[0].name='Vendor wording';p.looms[0].components[0].count=9;
 for(const category of categories)assert.equal(M.referenceLoomsForProject(p,refs,category).looms.length,0);assert.deepEqual(refs,before);
});
function newProjectFixture(unit='m'){const p=M.newProject('Generated test vendor');p.stock.vendor.lengthUnit=unit;return p;}
function loomReferenceFixture(){return {categories:{items:[{id:'cat-looms',name:'Stock / Pre-Made Looms',aliases:['Looms']}]},cable_types:{items:[{id:'ref-loom',name:'Loom',aliases:['Alias loom'],category:'Looms',lengthUnit:'ft',lengths:[304],components:[{id:'part',type:'XLR-5',count:2,connectors:{male:'Keep'},lengths:[304]}]}]}};}
test('different-unit loom lengths require explicit retention and never mutate reference values',()=>{
 const r=loomReferenceFixture(),before=M.clone(r),p=newProjectFixture(),plan=M.referenceLoomsForProject(p,r);
 assert.equal(plan.mismatches[0].unit,'ft');assert.equal(p.looms.length,0);M.addReferenceLooms(p,plan);assert.deepEqual(p.looms[0].lengths,[]);assert.deepEqual(p.looms[0].components[0].lengths,[]);assert.equal(p.looms[0].components[0].count,2);
 const q=newProjectFixture();M.addReferenceLooms(q,plan,{keepMismatchedLengths:true});assert.deepEqual(q.looms[0].lengths,[304]);assert.deepEqual(q.looms[0].components[0].lengths,[304]);assert.equal(q.stock.vendor.lengthUnit,'m');assert.deepEqual(r,before);
});
test('existing loom names and aliases prevent duplication without overwriting vendor values',()=>{
 const r=loomReferenceFixture(),p=newProjectFixture();p.looms=[{id:'vendor-id',name:'Alias loom',lengths:[1],components:[]}];const before=M.clone(p);
 assert.equal(M.referenceLoomsForProject(p,r).looms.length,0);assert.deepEqual(p,before);
});
test('published reference refresh brings in new records and untouched updates while retaining local edits/deletions',()=>{
 const prior={items:[{id:'a',name:'A',x:1},{id:'b',name:'B',x:1},{id:'c',name:'C',x:1}]};
 const local={items:[{id:'a',name:'A',x:9},{id:'b',name:'B',x:1},{id:'local',name:'Local'}]};
 const published={items:[{id:'a',name:'A',x:2},{id:'b',name:'B',x:2},{id:'c',name:'C',x:2},{id:'new',name:'New'}]};const before=M.clone([prior,local,published]);
 const merged=M.mergePublishedReference(local,published,prior);
 assert.deepEqual(merged.items,[{id:'a',name:'A',x:9},{id:'b',name:'B',x:2},{id:'local',name:'Local'},{id:'new',name:'New'}]);
 assert.deepEqual(M.newPublishedCableTypes(published,prior),[{id:'new',name:'New'}]);assert.deepEqual([prior,local,published],before);
 assert.deepEqual(M.mergePublishedReference(merged,published,published),merged);
});


test('new custom categories can seed from cable file without a separate category record',()=>{
 const r={categories:{items:[]},cable_types:{items:[{name:'Custom cable',category:'New type',connectors:{male:'A',female:'B'},direction:'male-female'}]}};
 assert(M.cableTypeSheets(r).includes('New type'));assert.equal(M.categoryCables('New type',r)[0].row.name,'Custom cable');
});

function fohFixture(){
 const r=loomReferenceFixture();r.categories.items.push({id:'cat-foh-snake',name:'FOH Snake',aliases:['Snake','FOH Multi'],type:'loom'});
 const snake=M.clone(r.cable_types.items[0]);Object.assign(snake,{id:'ref-snake',name:'FOH package',aliases:['FOH package alias'],category:'FOH Snake'});r.cable_types.items.push(snake);return r;
}
test('FOH Snake and its aliases use loom behaviour with a unique category ID',()=>{
 const r=fohFixture();for(const name of ['FOH Snake','Snake','FOH Multi'])assert.equal(M.isLoomCategory(name,r),true);
 assert.equal(M.isLoomCategory('Motor',r),false);assert.equal(M.isLoomCategory('FOH Snake'),true);
 const categories=refs.categories.items;assert.equal(new Set(categories.map(c=>c.id)).size,categories.length);const snake=M.referenceMatch(categories,'FOH Snake');assert(snake);for(const name of [snake.name,...(snake.aliases||[])])assert.equal(M.isLoomCategory(name,refs),true);
});
test('adding either loom category loads only its references and keeps unit safeguards',()=>{
 const r=fohFixture(),p=newProjectFixture('ft');M.addReferenceLooms(p,M.referenceLoomsForProject(p,r,'FOH Snake'));
 assert.deepEqual(M.projectLoomCategories(p),['FOH Snake']);assert.equal(p.looms.length,1);assert.equal(p.looms[0].category,'FOH Snake');assert.deepEqual(p.looms[0].lengths,[304]);
 M.addReferenceLooms(p,M.referenceLoomsForProject(p,r));assert.equal(p.looms.length,2);assert.equal(M.projectLoomRows(p,'FOH Snake').length,1);assert.equal(M.projectLoomRows(p,M.LOOM_CATEGORY).length,1);
 assert.equal(M.referenceLoomsForProject(p,r,'FOH Snake').looms.length,0);
 const metric=newProjectFixture();const plan=M.referenceLoomsForProject(metric,r,'FOH Snake');assert.equal(plan.mismatches.length,1);M.addReferenceLooms(metric,plan);assert.deepEqual(metric.looms[0].lengths,[]);assert.deepEqual(metric.looms[0].components[0].lengths,[]);
});

test('FOH edits and deletion preserve other looms and the review baseline',()=>{
 const p=newProjectFixture('ft'),r=fohFixture();for(const cat of [M.LOOM_CATEGORY,'FOH Snake'])M.addReferenceLooms(p,M.referenceLoomsForProject(p,r,cat));p.baseline=M.snapshot(p);
 const other=M.clone(M.projectLoomRows(p,M.LOOM_CATEGORY));const rows=M.clone(M.projectLoomRows(p,'FOH Snake'));rows[0].components[0].count=7;M.replaceProjectLooms(p,'FOH Snake',rows);
 assert.deepEqual(M.projectLoomRows(p,M.LOOM_CATEGORY),other);assert(M.changes(p).some(c=>c.category==='FOH Snake'&&c.kind==='modified'));
 rows[0].components[0].count=0;M.replaceProjectLooms(p,'FOH Snake',rows);assert(M.validate(p).some(i=>i.category==='FOH Snake'&&i.field==='components'));
 M.removeProjectCategory(p,M.LOOM_CATEGORY,{looms:true});assert.equal(p.looms.length,1);assert.equal(p.looms[0].category,'FOH Snake');assert.deepEqual(M.projectLoomCategories(p),['FOH Snake']);assert.equal(p.baseline.looms.length,2);
});
test('FOH project and Excel round trips retain separate sheets and agreed stock schema',()=>{
 const p=newProjectFixture('ft'),r=fohFixture();for(const cat of [M.LOOM_CATEGORY,'FOH Snake'])M.addReferenceLooms(p,M.referenceLoomsForProject(p,r,cat));
 assert.deepEqual(M.restoreProject(M.clone(p)),p);const result=roundtrip(p);assert.deepEqual(result.project.looms,p.looms);assert.deepEqual(M.projectLoomCategories(result.project),M.projectLoomCategories(p));
 assert.equal(result.categories.filter(m=>m.kind==='looms').length,2);assert.deepEqual(M.runtimeJSON(result.project),M.runtimeJSON(p));
 const output=M.runtimeJSON(p);assert.deepEqual(Object.keys(output.cables['FOH Snake'][0]),['id','name','lengths','cables']);assert.deepEqual(M.runtimeJSON(M.projectFromStock(output)),output);
});
test('FOH category Excel export and replacement affect only that category, including empty sheets',()=>{
 const p=newProjectFixture('ft'),r=fohFixture();for(const cat of [M.LOOM_CATEGORY,'FOH Snake'])M.addReferenceLooms(p,M.referenceLoomsForProject(p,r,cat));
 const exported=roundtrip(p,{category:'FOH Snake'});assert.equal(exported.project.looms.length,1);assert.equal(exported.categories.length,1);assert.equal(exported.categories[0].category,'FOH Snake');
 exported.project.looms[0].components[0].count=9;let result=replaceWorkbook(p,exported.project,true,exported.categories);assert.deepEqual(M.projectLoomRows(result,M.LOOM_CATEGORY),M.projectLoomRows(p,M.LOOM_CATEGORY));assert.equal(M.projectLoomRows(result,'FOH Snake')[0].components[0].count,9);
 const blank=roundtrip(p,{category:'FOH Snake',blank:true});assert.deepEqual(M.projectLoomCategories(blank.project),['FOH Snake']);result=replaceWorkbook(p,blank.project,true,blank.categories);assert.equal(result.looms.length,1);assert(M.projectLoomCategories(result).includes('FOH Snake'));
 const merged=M.mergeProjects(newProjectFixture(),blank.project,true);assert(M.projectLoomCategories(merged).includes('FOH Snake'));
});
test('cached duplicate category IDs reconcile by name without merging FOH into pre-made looms',()=>{
 const old={items:[{id:'cat-looms',name:M.LOOM_CATEGORY,aliases:[]},{id:'cat-looms',name:'FOH Snake',aliases:['Snake']}]};
 const published=M.clone(old);published.items[1].id='cat-foh-snake';published.items[1].type='loom';
 assert.deepEqual(M.mergePublishedReference(old,published,old),published);
 const local=M.clone(old);local.items[1].aliases.push('My alias');const result=M.mergePublishedReference(local,published,old);assert.deepEqual(result.items[1],local.items[1]);assert.equal(result.items[0].name,M.LOOM_CATEGORY);assert(M.isLoomCategory('My alias',{categories:result}));
});

test('direction choices accept arrows and legacy tokens, reject unrelated direction text',()=>{
 for(const [label,token] of [['male > female','male-female'],['female > male','female-male'],['bidirectional','bidirectional']]){
  assert.equal(M.parseDirection(label),token);assert.equal(M.parseDirection(token),token);assert.equal(M.directionLabel(token),label);
  const row={name:'Test',category:'Test',direction:label,connectors:{male:'M',female:'F',end:'E'}};
  assert.deepEqual(M.validateReferences({cable_types:{items:[row]}}),[]);
 }
 for(const value of ['male > Tails','male > 2 x Female','',null])assert.throws(()=>M.parseDirection(value),/Choose/);
});
test('reverse direction endpoints edit by gender and preserve custom connector data',()=>{
 for(const direction of ['female-male','female > male']){
  const row={direction,connectors:{male:'M',female:'F',extra:7}};
  assert.equal(M.getCell(row,'start'),'F');assert.equal(M.getCell(row,'end'),'M');
  M.setCell(row,'start','F2');M.setCell(row,'end','M2');assert.deepEqual(row.connectors,{male:'M2',female:'F2',extra:7});
 }
});
test('explicit reverse connector input and reference defaults validate and approve in direction order',()=>{
 const p=M.projectFromStock({vendor:{name:'Test',lengthUnit:'m'},cables:{Data:[{name:'Known',direction:'female > male',connectors:{female:'Override'},lengths:[2]},{name:'Unknown',direction:'female-male',connectors:{},lengths:[3]}]}});
 const r={cable_types:{items:[{name:'Known',direction:'female-male',connectors:{male:'M',female:'F'}}]},connector_types:{items:[{name:'M'},{name:'Override'}]}};
 p.filename='test.json';M.inheritCableConnectors(p.stock.cables.Data[0],r.cable_types.items);p.stock.cables.Data[1].connectors={female:'Unknown',male:'Unknown'};assert.deepEqual(p.stock.cables.Data[0].connectors,{female:'Override',male:'M'});
 assert.deepEqual(M.connectorReviews(p,r)[0].usages.map(x=>x.key),['female','male']);
 M.approveConnector(p,r,'Unknown','Approved');assert.deepEqual(M.connectorReviews(p,r),[]);
 assert.deepEqual(M.validate(p),[]);assert.equal(M.cableNeedsConnectorInputs(p.stock.cables.Data[0],r.cable_types.items),false);
 delete p.stock.cables.Data[0].connectors.female;assert.equal(M.validate(p)[0].field,'start');
});
test('all direction forms preserve JSON and Excel round trips and export endpoints in order',()=>{
 const rows=['male-female','male > female','female-male','female > male','bidirectional'].map(direction=>({name:direction,direction,connectors:direction==='bidirectional'?{end:'E'}:{male:'M',female:'F',extra:'keep'},lengths:[1,5]}));
 const p=M.projectFromStock({vendor:{name:'Directions',lengthUnit:'m'},cables:{Data:rows}});
 assert.deepEqual(M.runtimeJSON(M.projectFromStock(M.runtimeJSON(p))),M.runtimeJSON(p));
 assert.deepEqual(M.runtimeJSON(roundtrip(p).project),M.runtimeJSON(p));
 const book=toWorkbook(p,X);assert.equal(book.Sheets.Data.D4.v,'F');assert.equal(book.Sheets.Data.E4.v,'M');
 book.Sheets.Data.D4.v='New F';book.Sheets.Data.E4.v='New M';
 assert.deepEqual(fromWorkbook(book,X,p).project.stock.cables.Data[2].connectors,{male:'New M',female:'New F',extra:'keep'});
});
test('Excel direction-only reversal retains gendered connector identities',()=>{
 const p=M.projectFromStock({vendor:{name:'Test',lengthUnit:'m'},cables:{Data:[{name:'Test',direction:'male-female',connectors:{male:'M',female:'F'},lengths:[2]}]}});
 const book=toWorkbook(p,X);book.Sheets.Data.C2.v='female-male';const row=fromWorkbook(book,X,p).project.stock.cables.Data[0];
 assert.deepEqual(row.connectors,{male:'M',female:'F'});assert.equal(M.getCell(row,'start'),'F');
});

test('same-gender directions accept labels and tokens with independent connectors',()=>{
 for(const gender of ['male','female']){
  const token=`${gender}-${gender}`,label=`${gender} > ${gender}`;
  assert.equal(M.parseDirection(label.toUpperCase()),token);assert.equal(M.directionLabel(token),label);
  const row={direction:token,connectors:{start:'XLR-3',end:'XLR-5',custom:'keep'}};
  M.setCell(row,'start','RJ45');assert.equal(M.getCell(row,'end'),'XLR-5');
  M.setCell(row,'end','etherCON');assert.equal(M.getCell(row,'start'),'RJ45');assert.equal(row.connectors.custom,'keep');
  assert.deepEqual(M.validateReferences({cable_types:{items:[{...row,name:'Test',category:'Data'}]}}),[]);
 }
});
test('direction transitions keep both connector types and existing metadata',()=>{
 const row={direction:'male-female',connectors:{male:'XLR-3',female:'XLR-5',custom:42}};
 for(const direction of ['male-male','female-female','female-male','male-male']){
  M.setCell(row,'direction',direction);assert.equal(M.getCell(row,'start'),'XLR-3');assert.equal(M.getCell(row,'end'),'XLR-5');assert.equal(row.connectors.custom,42);
 }
 M.setCell(row,'direction','bidirectional');assert.equal(M.getCell(row,'start'),'XLR-3');assert.equal(M.getCell(row,'end'),'XLR-5');
});
test('same-gender missing defaults inherit and unknown endpoints remain reviewable',()=>{
 const row={name:'Known',direction:'male-male',connectors:{start:'Override'},lengths:[5]};
 const r={cable_types:{items:[{name:'Known',direction:'male-male',connectors:{start:'A',end:'B'}}]},connector_types:{items:[{name:'Override'}]}};
 const p=M.projectFromStock({vendor:{name:'Test',lengthUnit:'m'},cables:{Data:[row]}},'test.json');
 M.inheritCableConnectors(p.stock.cables.Data[0],r.cable_types.items);assert.deepEqual(p.stock.cables.Data[0].connectors,{start:'Override',end:'B'});
 assert.equal(M.cableNeedsConnectorInputs(p.stock.cables.Data[0],r.cable_types.items),false);
 assert.deepEqual(M.connectorReviews(p,r)[0].usages.map(u=>u.key),['end']);M.approveConnector(p,r,'B','Approved');assert.deepEqual(M.connectorReviews(p,r),[]);assert.deepEqual(M.validate(p),[]);
 delete p.stock.cables.Data[0].connectors.start;assert.equal(M.getCell(p.stock.cables.Data[0],'start'),'');assert.equal(M.validate(p)[0].field,'start');
 const unknown={name:'Unknown',direction:'female-female',connectors:{},lengths:[1]};p.stock.cables.Data.push(unknown);M.validate(p);assert.deepEqual(unknown.connectors,{});
});
test('same-gender JSON, project and Excel round trips keep distinct endpoint types',()=>{
 const rows=['male-male','female-female','Male > Male','Female > Female'].map(direction=>({name:direction,direction,connectors:{start:'A',end:'B',custom:42},lengths:[2,5]}));
 const p=M.projectFromStock({vendor:{name:'Test',lengthUnit:'m'},cables:{Data:rows}},'test.json');
 assert.deepEqual(M.runtimeJSON(M.projectFromStock(M.runtimeJSON(p))),M.runtimeJSON(p));assert.deepEqual(M.restoreProject(M.clone(p)),p);assert.deepEqual(M.runtimeJSON(roundtrip(p).project),M.runtimeJSON(p));
 const book=toWorkbook(p,X);assert.equal(book.Sheets.Data.D2.v,'A');assert.equal(book.Sheets.Data.E2.v,'B');book.Sheets.Data.D2.v='Changed';assert.deepEqual(fromWorkbook(book,X,p).project.stock.cables.Data[0].connectors,{start:'Changed',end:'B',custom:42});
});
test('Excel direction-only edits map same-gender endpoints without losing connector data',()=>{
 const p=M.projectFromStock({vendor:{name:'Test',lengthUnit:'m'},cables:{Data:[{name:'Test',direction:'male-female',connectors:{male:'A',female:'B',custom:42},lengths:[5]}]}},'test.json');
 for(const direction of ['male-male','female-female','female-male']){
  const book=toWorkbook(p,X);book.Sheets.Data.C2.v=direction;p.stock.cables.Data=fromWorkbook(book,X,p).project.stock.cables.Data;
  assert.equal(M.getCell(p.stock.cables.Data[0],'start'),'A');assert.equal(M.getCell(p.stock.cables.Data[0],'end'),'B');assert.equal(p.stock.cables.Data[0].connectors.custom,42);
 }
});
