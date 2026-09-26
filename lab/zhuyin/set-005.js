export const lockedSourceText=Object.freeze([
 '在涅貴不「緇」',
 '「黝」黑',
 '青紅「皂」白',
 '「玄」端',
 '黑金政治',
 '黑心',
 '抹黑'
]);

export const items=Object.freeze(lockedSourceText.map((prompt,i)=>Object.freeze({id:i+1,prompt,lockedSourceText:prompt})));

export const learningNotes=Object.freeze([
 {word:'緇',sound:'＝ 黑色',meaning:'緇，本義是黑色。',label:'白話解釋',explanation:'這裡先讓學生牢記：「緇」看到就想到黑色。',caption:'安妮亞拿著一匹被染成黑色的布。圖像記憶：緇 → 黑布 → 黑色',kind:'literal'},
 {word:'黝',sound:'＝ 深黑、青黑',meaning:'黝黑＝顏色很深的黑，也可帶有青黑色。',label:'白話解釋',explanation:'「黝」表示黑得很深。',caption:'安妮亞看著一塊非常深黑的石頭或黑炭。圖像記憶：黝 → 黑得很深',kind:'literal'},
 {word:'皂',sound:'＝ 黑色',meaning:'皂，在這裡是黑色。',label:'青紅皂白',explanation:'由青、紅、黑、白四種顏色引申，常指事情的是非、來龍去脈。',caption:'安妮亞面前排列青、紅、黑、白四色卡，並指出黑色色塊。圖像記憶：皂 → 黑',kind:'literal'},
 {word:'玄',sound:'＝ 黑色',meaning:'玄端＝古代黑色的祭服／禮服。',label:'白話解釋',explanation:'「玄」在這個詞裡表示黑色。',caption:'安妮亞看到一件古代黑色禮服。圖像記憶：玄 → 黑色古代禮服',kind:'literal'},
 {word:'黑',sound:'＝ 負面的「黑」',meaning:'黑金政治：諷稱與黑道或與財團勾結行事的政治風氣。',label:'引申義',explanation:'這裡的「黑」已不是單純顏色，而是帶有不正當、陰暗的引申義。',caption:'黑色陰影、金色錢幣與握手剪影。圖像記憶：黑＋金 → 不正當利益勾結',kind:'figurative'},
 {word:'黑',sound:'＝ 陰險狠毒',meaning:'黑心＝比喻人心地陰險狠毒。',label:'引申義',explanation:'這不是說心臟真的變黑，而是「黑」的負面比喻義。',caption:'安妮亞看到一顆象徵性的黑色心形，露出警覺表情。圖像記憶：黑心 → 壞心眼',kind:'figurative'},
 {word:'黑',sound:'＝ 負面形象',meaning:'抹黑＝比喻醜化或歪曲事實，使別人的形象變差。',label:'引申義',explanation:'像抹上黑色一樣，把原本的形象弄壞。',caption:'一張乾淨的虛構剪影照片被黑色墨跡塗污。圖像記憶：抹上黑色 → 形象被弄壞',kind:'figurative'}
].map(Object.freeze));

export const summaryLiteral=Object.freeze([['緇','黑色'],['黝','深黑、青黑'],['皂','黑色'],['玄','黑色']].map(Object.freeze));
export const summaryFigurative=Object.freeze([['黑金','不正當利益'],['黑心','陰險狠毒'],['抹黑','醜化、歪曲']].map(Object.freeze));

export function verifyColorItems(rows,source=lockedSourceText){
 const errors=[];
 if(!Array.isArray(rows)||rows.length!==7)errors.push('題數必須為 7');
 if(!Array.isArray(source)||source.length!==7)errors.push('鎖定原稿題數必須為 7');
 if(errors.length)return {ok:false,passed:0,errors};
 rows.forEach((row,i)=>{
  if(row.id!==i+1)errors.push(`第 ${i+1} 題編號不符`);
  if(row.prompt!==source[i]||row.lockedSourceText!==source[i])errors.push(`第 ${i+1} 題原稿不一致`);
 });
 return {ok:errors.length===0,passed:7-errors.length,errors};
}
