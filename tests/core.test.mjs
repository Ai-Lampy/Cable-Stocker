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
test('runtime excludes editor data, loom content, IDs and preferences',()=>{const p=fresh();p.looms=[{id:'loom-test',name:'Fixture test',lengths:[30],components:[]}];p.vendorVersion='v4';assert.deepEqual(M.runtimeJSON(p),source);assert(M.validate(p).some(i=>i.message.includes('generator backup')));});
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
test('duplicate lengths entered in Excel are retained and flagged, not silently discarded',()=>{const p=fresh(),book=toWorkbook(p,X);book.Sheets.Data.F2={t:'s',v:'2, 2, 3'};const r=fromWorkbook(book,X,p).project;assert.deepEqual(r.stock.cables.Data[0].lengths,[2,2,3]);assert(M.validate(r).some(i=>i.message==='Duplicate lengths.'));});
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
test('custom cable normal connector inputs fix validation without adaptor flag or runtime markers',()=>{const p=fresh();p.stock.cables.Custom=[M.defaultCable(null,'Custom cable')];p.rowIds.Custom=['custom'];const row=p.stock.cables.Custom[0];M.setCell(row,'start','Custom plug');M.setCell(row,'end','Custom socket');assert.equal(M.validate(p).filter(x=>x.category==='Custom'&&x.level==='error').length,0);assert.equal(M.isCableAdaptor(p,'Custom',0),false);assert.deepEqual(M.runtimeJSON(p).cables.Custom[0].connectors,{male:'Custom plug',female:'Custom socket'});});

test('bidirectional inherited end is visible despite old empty male/female keys',()=>{const row={name:'Ethernet',direction:'bidirectional',connectors:{male:'',female:'',end:'RJ45'}};assert.equal(M.getCell(row,'start'),'RJ45');assert.equal(M.getCell(row,'end'),'RJ45');M.setCell(row,'end','EtherCON');assert.equal(M.getCell(row,'end'),'EtherCON');});

test('missing connectors use cable names after reference inheritance, preserving overrides and malformed data',()=>{
 const p=fresh(),r=M.clone(refs);p.stock.cables.Custom=[M.defaultCable(null,'Review cable'),{name:'Two way',direction:'bidirectional',connectors:{},lengths:[]},{name:'Partial',direction:'male-female',connectors:{male:'XLR3',extra:4},lengths:[]},{name:'Bad',direction:'male-female',connectors:42,lengths:[]},M.defaultCable()];
 const baseline=M.clone(p.baseline);assert.equal(M.fillCableConnectors(p,r),true);
 assert.deepEqual(p.stock.cables.Custom[0].connectors,{male:'Review cable',female:'Review cable'});
 assert.deepEqual(p.stock.cables.Custom[1].connectors,{end:'Two way'});
 assert.deepEqual(p.stock.cables.Custom[2].connectors,{male:'XLR3',extra:4,female:'Partial'});
 assert.equal(p.stock.cables.Custom[3].connectors,42);assert.deepEqual(p.stock.cables.Custom[4].connectors,{male:'',female:''});assert.deepEqual(p.baseline,baseline);assert.equal(M.fillCableConnectors(p,r),false);
});
test('review groups unknown connector ends and approval corrects all uses without duplicate references',()=>{
 const p=fresh(),r=M.clone(refs);p.stock.cables.Custom=[M.defaultCable(null,'Review cable'),M.defaultCable(null,'review cable')];M.fillCableConnectors(p,r);
 const review=M.connectorReviews(p,r).find(x=>x.name==='Review cable');assert.equal(review.usages.length,4);
 const count=r.connector_types.items.length;assert.throws(()=>M.approveConnector(p,r,'Review cable','  '),/Enter/);assert.equal(r.connector_types.items.length,count);
 M.approveConnector(p,r,'Review cable','Approved connector');assert.equal(r.connector_types.items.length,count+1);assert(!M.connectorReviews(p,r).some(x=>x.name==='Approved connector'));
 assert.equal(p.stock.cables.Custom[1].connectors.female,'Approved connector');assert.throws(()=>M.approveConnector(p,r,'Review cable','Again'),/no longer/);
 p.stock.cables.Custom.push(M.defaultCable(null,'Another'));M.fillCableConnectors(p,r);M.approveConnector(p,r,'Another','approved connector');assert.equal(r.connector_types.items.length,count+1);
});
test('pending connector review survives stock JSON and project/Excel round trips without runtime metadata',()=>{
 const p=fresh(),r=M.clone(refs);p.stock.cables.Custom=[M.defaultCable(null,'Review cable')];p.rowIds.Custom=['test-review'];M.fillCableConnectors(p,r);
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
 const p=fresh(),r=M.clone(refs);p.stock.cables.Test=[M.defaultCable(null,'Unlisted')];M.fillCableConnectors(p,r);M.approveConnector(p,r,'Unlisted','Approved');
 assert.equal(r.connector_types.items.at(-1).category,'Test');assert.equal(p.stock.cables.Test[0].category,undefined);
});
