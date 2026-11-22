// Generator reference only: never modifies stock, its lengths, or runtime exports.
export function cableWeightRows(stock,category,data){
  const norm=value=>String(value||'').trim().toLocaleLowerCase();
  const factor=unit=>unit==='ft'?0.3048:unit==='m'?1:NaN;
  return (stock.cables[category]||[]).flatMap(row=>{
    const ref=data?.items?.find(item=>norm(item.vendor)===norm(stock.vendor.name)&&item.category===category&&norm(item.name)===norm(row.name));
    const lengths=[...new Set([...(row.lengths||[]),...(row.loomOnlyLengths||[])])].sort((a,b)=>a-b);
    return (lengths.length?lengths:['']).map(length=>{
      const found=length===''?null:ref?.weights.find(w=>Math.abs(w.length*factor(w.lengthUnit)-length*factor(stock.vendor.lengthUnit))<0.000001);
      return {name:row.name,length,lengthUnit:stock.vendor.lengthUnit,weight:found?.weight??'',weightUnit:found?.weightUnit||'',sourceUrl:ref?.sourceUrl||'',review:found?'':ref?.reviewNote||'No matching vendor-specific weight. Confirm the exact cable specification and weight for this length.'};
    });
  });
}
