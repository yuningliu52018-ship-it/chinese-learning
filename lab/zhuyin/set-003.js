export const lockedSourceText=Object.freeze([
 '商店打「ㄧㄤˊ」：烊',
 '「惴惴」不安：ㄓㄨㄟˋ ㄓㄨㄟˋ',
 '「曲」突徙薪：ㄑㄩ',
 '八面「ㄌㄧㄥˊ」瓏：玲',
 '手足無「措」：ㄘㄨㄛˋ',
 '派兵「ㄑㄧㄢˇ」將：遣',
 '「逾」時不補：ㄩˊ'
]);

export const items=Object.freeze([
 ['商店打「ㄧㄤˊ」','烊'],
 ['「惴惴」不安','ㄓㄨㄟˋ ㄓㄨㄟˋ'],
 ['「曲」突徙薪','ㄑㄩ'],
 ['八面「ㄌㄧㄥˊ」瓏','玲'],
 ['手足無「措」','ㄘㄨㄛˋ'],
 ['派兵「ㄑㄧㄢˇ」將','遣'],
 ['「逾」時不補','ㄩˊ']
].map(([prompt,answer],i)=>Object.freeze({id:i+1,prompt,answer,lockedSourceText:lockedSourceText[i]})));

export const learningNotes=Object.freeze([
 {word:'烊',sound:'ㄧㄤˊ',meaning:'打烊＝商店停止營業、關門。',label:'打烊',explanation:'商店停止營業、關門。',caption:'安妮亞在商店門口準備關門、收起招牌。重點＝「店關了」。'},
 {word:'惴惴',sound:'ㄓㄨㄟˋ ㄓㄨㄟˋ',meaning:'惴惴＝恐懼、憂慮的樣子。',label:'惴惴不安',explanation:'因害怕或擔心而心神不寧。',caption:'安妮亞緊張冒汗、雙手抓著衣角，表現忐忑不安。'},
 {word:'曲',sound:'ㄑㄩ',meaning:'曲＝使彎曲。',label:'曲突徙薪',explanation:'把煙囪改彎、把柴薪搬遠，比喻事先採取措施、防患未然。',caption:'安妮亞看到柴堆靠近火源，趕快把柴搬遠，避免失火。重點＝「事先預防」。'},
 {word:'玲',sound:'ㄌㄧㄥˊ',meaning:'玲瓏＝靈巧、圓融。',label:'八面玲瓏',explanation:'常形容待人處事圓滑周到。',caption:'安妮亞同時和四周不同的人友善應對，大家都很開心。重點＝「處事圓融」。'},
 {word:'措',sound:'ㄘㄨㄛˋ',meaning:'措＝安放、處置。',label:'手足無措',explanation:'手腳不知道該放哪裡，形容慌張得不知道怎麼辦。',caption:'安妮亞突然遇到狀況，兩手舉起、慌得不知道該怎麼辦。重點＝「慌亂」。'},
 {word:'遣',sound:'ㄑㄧㄢˇ',meaning:'遣＝派遣、差派。',label:'派兵遣將',explanation:'調派士兵和將領執行任務。',caption:'安妮亞像小指揮官一樣，指派不同隊伍出發。'},
 {word:'逾',sound:'ㄩˊ',meaning:'逾＝超過、越過。',label:'逾時',explanation:'超過規定的時間。',caption:'安妮亞看著時鐘，時間已經超過截止時間。重點＝「超時」。'}
].map(Object.freeze));
