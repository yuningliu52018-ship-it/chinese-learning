export const lockedSourceText=Object.freeze([
 '1.「撒」手人寰：ㄙㄚ',
 '2.「ㄉㄧㄝˊ ㄉㄧㄝˊ」不休：喋喋',
 '3. 煙波萬「頃」：ㄑㄧㄥˇ',
 '4. 個性狡「黠」：ㄒㄧㄚˊ',
 '5. 臨渴「掘」井：ㄐㄩㄝˊ',
 '6. 一葉「扁」舟：ㄆㄧㄢ',
 '7.「淌」淚傷懷：ㄊㄤˇ'
]);
export const items=Object.freeze([
 ['1.「撒」手人寰','ㄙㄚ'],['2.「ㄉㄧㄝˊ ㄉㄧㄝˊ」不休','喋喋'],
 ['3. 煙波萬「頃」','ㄑㄧㄥˇ'],['4. 個性狡「黠」','ㄒㄧㄚˊ'],
 ['5. 臨渴「掘」井','ㄐㄩㄝˊ'],['6. 一葉「扁」舟','ㄆㄧㄢ'],
 ['7.「淌」淚傷懷','ㄊㄤˇ']
].map(([prompt,answer],index)=>Object.freeze({id:index+1,prompt,answer,lockedSourceText:lockedSourceText[index]})));
