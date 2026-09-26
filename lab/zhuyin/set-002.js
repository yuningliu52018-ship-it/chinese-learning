export const lockedSourceText=Object.freeze([
 '危如「累」卵：ㄌㄟˇ',
 '大有「ㄅㄧˋ」益：裨',
 '發放軍「ㄒㄧㄤˇ」：餉',
 '覬「ㄩˊ」之心：覦',
 '「ㄅㄧㄝˊ」開生面：別',
 '「唾」手可得：ㄊㄨㄛˋ',
 '詐啞「ㄧㄤˊ」聾：佯'
]);
export const items=Object.freeze([
 ['危如「累」卵','ㄌㄟˇ'],['大有「ㄅㄧˋ」益','裨'],['發放軍「ㄒㄧㄤˇ」','餉'],['覬「ㄩˊ」之心','覦'],['「ㄅㄧㄝˊ」開生面','別'],['「唾」手可得','ㄊㄨㄛˋ'],['詐啞「ㄧㄤˊ」聾','佯']
].map(([prompt,answer],i)=>Object.freeze({id:i+1,prompt,answer,lockedSourceText:lockedSourceText[i]})));
export const learningNotes=Object.freeze([
 {word:'累',sound:'ㄌㄟˇ',meaning:'累＝堆疊。',label:'危如累卵',explanation:'像堆疊的蛋一樣危險，形容情勢非常危急。',caption:'安妮亞小心疊蛋，蛋搖搖欲墜。'},
 {word:'裨',sound:'ㄅㄧˋ',meaning:'裨＝幫助、補益。',label:'大有裨益',explanation:'有很大的幫助。',caption:'安妮亞得到很有幫助的提示或工具。'},
 {word:'餉',sound:'ㄒㄧㄤˇ',meaning:'餉＝軍人的薪資、糧餉。',label:'軍餉',explanation:'發給軍人的薪資或糧食。',caption:'安妮亞把薪餉發給士兵。'},
 {word:'覦',sound:'ㄩˊ',meaning:'覦＝非分地希望得到。',label:'覬覦',explanation:'想得到原本不屬於自己的東西。',caption:'安妮亞偷偷看著別人的東西，露出很想得到的表情。'},
 {word:'別',sound:'ㄅㄧㄝˊ',meaning:'別＝另外、不同。',label:'別開生面',explanation:'另外開創新的局面或形式。',caption:'安妮亞打開一扇全新的門，看到完全不同的新世界。'},
 {word:'唾',sound:'ㄊㄨㄛˋ',meaning:'唾＝吐口水。',label:'唾手可得',explanation:'往手上吐口水就能得到，比喻非常容易取得。',caption:'安妮亞伸手就輕鬆拿到物品，表現「非常容易得到」。'},
 {word:'佯',sound:'ㄧㄤˊ',meaning:'佯＝假裝。',label:'詐啞佯聾',explanation:'假裝不會說話、假裝聽不見，比喻故意裝作不知道。',caption:'安妮亞故意摀住耳朵，裝作「我沒聽到」。'}
].map(Object.freeze));
