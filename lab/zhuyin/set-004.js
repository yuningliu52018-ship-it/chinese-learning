export const lockedSourceText=Object.freeze([
 '羽扇「綸」巾：ㄍㄨㄢ',
 '邊「ㄔㄨㄟˊ」地區：陲',
 '縱橫「捭」闔：ㄅㄞˇ',
 '不「諳」世事：ㄢ',
 '語焉不「ㄒㄧㄤˊ」：詳',
 '言簡意「賅」：ㄍㄞ',
 '聰明「ㄌㄧㄥˊ」俐：伶'
]);

export const items=Object.freeze([
 ['羽扇「綸」巾','ㄍㄨㄢ'],
 ['邊「ㄔㄨㄟˊ」地區','陲'],
 ['縱橫「捭」闔','ㄅㄞˇ'],
 ['不「諳」世事','ㄢ'],
 ['語焉不「ㄒㄧㄤˊ」','詳'],
 ['言簡意「賅」','ㄍㄞ'],
 ['聰明「ㄌㄧㄥˊ」俐','伶']
].map(([prompt,answer],i)=>Object.freeze({id:i+1,prompt,answer,lockedSourceText:lockedSourceText[i]})));

export const learningNotes=Object.freeze([
 {word:'綸',sound:'ㄍㄨㄢ',meaning:'綸巾＝古代用青絲帶做的頭巾。',label:'羽扇綸巾',explanation:'形容從容儒雅的裝束、氣度。',caption:'安妮亞拿著羽扇、戴著古代頭巾，神情從容自信。重點＝「綸巾」。'},
 {word:'陲',sound:'ㄔㄨㄟˊ',meaning:'陲＝邊疆、邊境。',label:'邊陲地區',explanation:'靠近國家邊界的地方。',caption:'安妮亞站在地圖最邊緣、靠近邊界線的位置。重點＝「邊境」。'},
 {word:'捭',sound:'ㄅㄞˇ',meaning:'捭＝開。闔＝合。',label:'縱橫捭闔',explanation:'指運用政治、外交等手段，進行聯合、分化或靈活應對。',caption:'安妮亞面前有兩扇門，一扇打開、一扇合上。重點＝「開／合」。'},
 {word:'諳',sound:'ㄢ',meaning:'諳＝熟悉、了解。',label:'不諳世事',explanation:'不了解人情世故，對社會情況不熟悉。',caption:'安妮亞看著複雜的大人世界，露出困惑、不太懂的表情。重點＝「不熟悉」。'},
 {word:'詳',sound:'ㄒㄧㄤˊ',meaning:'詳＝詳細、完備。',label:'語焉不詳',explanation:'雖然有提到，但說得不夠詳細。',caption:'安妮亞只講了一點點，旁邊的人滿頭疑惑，表示資訊不夠完整。重點＝「不夠詳細」。'},
 {word:'賅',sound:'ㄍㄞ',meaning:'賅＝完備、包括。',label:'言簡意賅',explanation:'話雖然很簡短，但意思完整、重點齊全。',caption:'安妮亞只用一句很短的話，就把事情講清楚。重點＝「簡短但完整」。'},
 {word:'伶',sound:'ㄌㄧㄥˊ',meaning:'伶俐＝聰明、靈活、反應快。',label:'聰明伶俐',explanation:'形容人機靈、反應快。',caption:'安妮亞很快想到答案，露出機靈得意的表情。重點＝「聰明靈活」。'}
].map(Object.freeze));
