const entry=(id,source,type,stem,prompt,choices,answer,character,explanation,set,image,tags=[])=>{const card=Number(image?.match(/q(\d+)\.png$/)?.[1]);return {id:`q-${id}`,source,type,stem,prompt,choices,answer,knowledgePointId:`kp-${id}`,target:character,tags:[type,...tags],memoryWall:set?{set,q:card}:null,explanation,character,memoryWallSet:set||null,specificImage:image||null}};

const base=[
 entry('sa','「撒」手人寰：ㄙㄚ','pronunciation','「撒」手人寰','「撒」怎麼念？',['ㄙㄚ','ㄙㄚˇ','ㄙㄚˋ'],0,'撒','「撒」是放開、放手，念 ㄙㄚ。','001','/themes/spy-family/q1.png'),
 entry('die','「ㄉㄧㄝˊ ㄉㄧㄝˊ」不休：喋喋','shape','「ㄉㄧㄝˊ ㄉㄧㄝˊ」不休','應填入哪一組字？',['喋喋','諜諜','蝶蝶'],0,'喋喋','喋喋不休是不停地說話。','001','/themes/spy-family/q2.png'),
 entry('qing','煙波萬「頃」：ㄑㄧㄥˇ','pronunciation','煙波萬「頃」','「頃」怎麼念？',['ㄑㄧㄥˇ','ㄑㄧㄥ','ㄑㄧㄥˋ'],0,'頃','「頃」在煙波萬頃中念 ㄑㄧㄥˇ。','001','/themes/spy-family/q3.png'),
 entry('xia','個性狡「黠」：ㄒㄧㄚˊ','pronunciation','個性狡「黠」','「黠」怎麼念？',['ㄒㄧㄚˊ','ㄐㄧㄝˊ','ㄒㄧㄝˊ'],0,'黠','「黠」是聰明而帶有狡猾，念 ㄒㄧㄚˊ。','001','/themes/spy-family/q4.png'),
 entry('jue','臨渴「掘」井：ㄐㄩㄝˊ','pronunciation','臨渴「掘」井','「掘」怎麼念？',['ㄐㄩㄝˊ','ㄐㄩㄝˇ','ㄑㄩ'],0,'掘','「掘」是挖，念 ㄐㄩㄝˊ。','001','/themes/spy-family/q5.png'),
 entry('pian','一葉「扁」舟：ㄆㄧㄢ','polyphone','一葉「扁」舟','「扁」怎麼念？',['ㄆㄧㄢ','ㄅㄧㄢˇ','ㄆㄧㄢˇ'],0,'扁','「扁舟」是小船，「扁」念 ㄆㄧㄢ。','001','/themes/spy-family/q6.png',['多音字']),
 entry('tang','「淌」淚傷懷：ㄊㄤˇ','pronunciation','「淌」淚傷懷','「淌」怎麼念？',['ㄊㄤˇ','ㄊㄤ','ㄕㄤˇ'],0,'淌','「淌」是液體往下流，念 ㄊㄤˇ。','001','/themes/spy-family/q7.png'),
 entry('lei','危如「累」卵：ㄌㄟˇ','pronunciation','危如「累」卵','「累」怎麼念？',['ㄌㄟˇ','ㄌㄟˋ','ㄌㄟˊ'],0,'累','危如累卵的「累」是堆疊，念 ㄌㄟˇ。','002','/themes/spy-family/set-002/q1.png'),
 entry('bi','大有「ㄅㄧˋ」益：裨','shape','大有「ㄅㄧˋ」益','應填入哪一個字？',['裨','脾','碑'],0,'裨','大有裨益表示有很大的幫助。','002','/themes/spy-family/set-002/q2.png'),
 entry('xiang','發放軍「ㄒㄧㄤˇ」：餉','shape','發放軍「ㄒㄧㄤˇ」','應填入哪一個字？',['餉','響','享'],0,'餉','軍餉是發給軍人的薪資或糧食。','002','/themes/spy-family/set-002/q3.png'),
 entry('yu-covet','覬「ㄩˊ」之心：覦','shape','覬「ㄩˊ」之心','應填入哪一個字？',['覦','逾','愉'],0,'覦','覬覦是想得到原本不屬於自己的東西。','002','/themes/spy-family/set-002/q4.png'),
 entry('bie','「ㄅㄧㄝˊ」開生面：別','shape','「ㄅㄧㄝˊ」開生面','應填入哪一個字？',['別','彆','憋'],0,'別','別開生面是另外開創新的局面或形式。','002','/themes/spy-family/set-002/q5.png'),
 entry('tuo','「唾」手可得：ㄊㄨㄛˋ','pronunciation','「唾」手可得','「唾」怎麼念？',['ㄊㄨㄛˋ','ㄉㄨㄛˋ','ㄊㄨㄟˋ'],0,'唾','唾手可得的「唾」念 ㄊㄨㄛˋ。','002','/themes/spy-family/set-002/q6.png'),
 entry('yang-pretend','詐啞「ㄧㄤˊ」聾：佯','shape','詐啞「ㄧㄤˊ」聾','應填入哪一個字？',['佯','洋','揚'],0,'佯','「佯」是假裝。','002','/themes/spy-family/set-002/q7.png'),
 entry('yang-close','商店打「ㄧㄤˊ」：烊','shape','商店打「ㄧㄤˊ」','應填入哪一個字？',['烊','洋','揚'],0,'烊','打烊就是商店停止營業、關門。','003','/themes/spy-family/set-003/q1.png'),
 entry('zhui','「惴惴」不安：ㄓㄨㄟˋ ㄓㄨㄟˋ','pronunciation','「惴惴」不安','「惴惴」怎麼念？',['ㄓㄨㄟˋ ㄓㄨㄟˋ','ㄔㄨㄞˇ ㄔㄨㄞˇ'],0,'惴惴','惴惴是恐懼、憂慮的樣子。','003','/themes/spy-family/set-003/q2.png'),
 entry('qu','「曲」突徙薪：ㄑㄩ','pronunciation','「曲」突徙薪','「曲」怎麼念？',['ㄑㄩ','ㄑㄩˇ','ㄑㄩˋ'],0,'曲','曲突徙薪的「曲」念 ㄑㄩ。','003','/themes/spy-family/set-003/q3.png'),
 entry('ling-round','八面「ㄌㄧㄥˊ」瓏：玲','shape','八面「ㄌㄧㄥˊ」瓏','應填入哪一個字？',['玲','伶','鈴'],0,'玲','八面玲瓏常形容待人處事圓滑周到。','003','/themes/spy-family/set-003/q4.png'),
 entry('cuo','手足無「措」：ㄘㄨㄛˋ','pronunciation','手足無「措」','「措」怎麼念？',['ㄘㄨㄛˋ','ㄔㄨㄛˋ','ㄘㄨㄛ'],0,'措','手足無措形容慌張得不知道怎麼辦。','003','/themes/spy-family/set-003/q5.png'),
 entry('qian','派兵「ㄑㄧㄢˇ」將：遣','shape','派兵「ㄑㄧㄢˇ」將','應填入哪一個字？',['遣','譴','淺'],0,'遣','派兵遣將的「遣」是派遣、差派。','003','/themes/spy-family/set-003/q6.png'),
 entry('yu-over','「逾」時不補：ㄩˊ','pronunciation','「逾」時不補','「逾」怎麼念？',['ㄩˊ','ㄩˋ','ㄩˇ'],0,'逾','「逾」是超過、越過，念 ㄩˊ。','003','/themes/spy-family/set-003/q7.png'),
 entry('guan','羽扇「綸」巾：ㄍㄨㄢ','polyphone','羽扇「綸」巾','「綸」怎麼念？',['ㄍㄨㄢ','ㄌㄨㄣˊ','ㄍㄨㄣ'],0,'綸','「綸」在羽扇綸巾中念 ㄍㄨㄢ。','004','/themes/spy-family/set-004/q1.png',['多音字']),
 entry('chui','邊「ㄔㄨㄟˊ」地區：陲','shape','邊「ㄔㄨㄟˊ」地區','應填入哪一個字？',['陲','垂','捶'],0,'陲','陲是邊疆、邊境。','004','/themes/spy-family/set-004/q2.png'),
 entry('bai','縱橫「捭」闔：ㄅㄞˇ','pronunciation','縱橫「捭」闔','「捭」怎麼念？',['ㄅㄞˇ','ㄅㄧˋ','ㄆㄞˇ'],0,'捭','捭是開，闔是合。','004','/themes/spy-family/set-004/q3.png'),
 entry('an','不「諳」世事：ㄢ','pronunciation','不「諳」世事','「諳」怎麼念？',['ㄢ','ㄧㄣ','ㄢˋ'],0,'諳','「諳」是熟悉、了解，念 ㄢ。','004','/themes/spy-family/set-004/q4.png'),
 entry('xiang-detail','語焉不「ㄒㄧㄤˊ」：詳','shape','語焉不「ㄒㄧㄤˊ」','應填入哪一個字？',['詳','祥','翔'],0,'詳','語焉不詳是說得不夠詳細。','004','/themes/spy-family/set-004/q5.png'),
 entry('gai','言簡意「賅」：ㄍㄞ','pronunciation','言簡意「賅」','「賅」怎麼念？',['ㄍㄞ','ㄏㄞˊ','ㄎㄜˊ'],0,'賅','言簡意賅的「賅」念 ㄍㄞ。','004','/themes/spy-family/set-004/q6.png'),
 entry('ling-clever','聰明「ㄌㄧㄥˊ」俐：伶','shape','聰明「ㄌㄧㄥˊ」俐','應填入哪一個字？',['伶','玲','鈴'],0,'伶','聰明伶俐形容人機靈、反應快。','004','/themes/spy-family/set-004/q7.png'),
 entry('zi','在涅貴不「緇」','meaning','在涅貴不「緇」','「緇」的本義是什麼？',['黑色','白色','紅色'],0,'緇','「緇」看到就想到黑色。','005','/themes/spy-family/set-005/q1.png'),
 entry('you-black','「黝」黑','meaning','「黝」黑','「黝黑」最接近哪個意思？',['深黑或青黑','鮮紅','淡黃'],0,'黝','黝黑是很深的黑，也可帶青黑色。','005','/themes/spy-family/set-005/q2.png'),
 entry('zao','青紅「皂」白','meaning','青紅「皂」白','「皂」在這裡是什麼意思？',['黑色','灰色','棕色'],0,'皂','「皂」在青紅皂白中是黑色。','005','/themes/spy-family/set-005/q3.png'),
 entry('xuan','「玄」端','meaning','「玄」端','「玄」在這裡表示什麼？',['黑色','黃色','白色'],0,'玄','玄端是古代黑色的祭服或禮服。','005','/themes/spy-family/set-005/q4.png'),
 entry('black-gold','黑金政治','polysemy','黑金政治','這裡的「黑」是什麼用法？',['不正當、陰暗的引申義','單純顏色','夜晚'],0,'黑','這裡的黑帶有不正當、陰暗的引申義。','005','/themes/spy-family/set-005/q5.png',['一字多義']),
 entry('black-heart','黑心','polysemy','黑心','「黑心」是什麼意思？',['心地陰險狠毒','心臟顏色黑','心情難過'],0,'黑','黑心比喻人心地陰險狠毒。','005','/themes/spy-family/set-005/q6.png',['一字多義']),
 entry('smear','抹黑','polysemy','抹黑','「抹黑」是什麼意思？',['醜化或歪曲事實','塗黑牆壁','關掉燈光'],0,'黑','抹黑比喻醜化或歪曲事實。','005','/themes/spy-family/set-005/q7.png',['一字多義'])
];

const variants=[
 {...base.find(q=>q.id==='q-pian'),id:'q-pian-compare',type:'confusable',prompt:'哪一組讀音正確？',choices:['扁舟 ㄆㄧㄢ／扁平 ㄅㄧㄢˇ','扁舟 ㄅㄧㄢˇ／扁平 ㄆㄧㄢ'],answer:0,tags:['confusable','多音字']},
 {...base.find(q=>q.id==='q-guan'),id:'q-guan-compare',type:'confusable',prompt:'哪一組讀音正確？',choices:['綸巾 ㄍㄨㄢ／經綸 ㄌㄨㄣˊ','綸巾 ㄌㄨㄣˊ／經綸 ㄍㄨㄢ'],answer:0,tags:['confusable','多音字']},
 {...base.find(q=>q.id==='q-qian'),id:'q-qian-compare',type:'confusable',stem:'遣／譴',prompt:'「派兵遣將」應使用哪個字？',choices:['遣','譴'],answer:0,tags:['confusable','形近字']},
 {id:'q-gong-polyphone',source:'供奉／供應',type:'pronunciation',stem:'「供奉」的「供」',prompt:'「供」怎麼念？',choices:['ㄍㄨㄥ','ㄍㄨㄥˋ'],answer:1,knowledgePointId:'kp-gong-polyphone',target:'供',tags:['pronunciation','fixture','多音字'],memoryWall:null,explanation:'「供奉」的「供」念 ㄍㄨㄥˋ。',isFixture:true},
 {id:'q-fixture-meaning',source:'【驗收 fixture】洞若觀火',type:'meaning',stem:'洞若觀火',prompt:'「洞若觀火」最接近哪個意思？',choices:['看得非常清楚','完全不知道'],answer:0,knowledgePointId:'kp-fixture-meaning',target:'洞若觀火',tags:['meaning','fixture','generic-image'],memoryWall:null,explanation:'洞若觀火形容觀察事物非常清楚。',isFixture:true},
 {id:'q-black-family',source:'緇／皂／玄',type:'confusable',stem:'緇／皂／玄',prompt:'這三個字共同可表示哪種顏色？',choices:['黑色','紅色','白色'],answer:0,knowledgePointId:'kp-black-family',target:'緇／皂／玄',tags:['confusable','字義'],memoryWall:{set:'005'},explanation:'緇、皂、玄都可連到黑色。'}
];

export const questions=Object.freeze([...base,...variants].map(question=>Object.freeze(question)));

const byKnowledge=new Map();
for(const question of questions){const ids=byKnowledge.get(question.knowledgePointId)||[];ids.push(question.id);byKnowledge.set(question.knowledgePointId,ids)}

export const knowledgePoints=Object.freeze([...byKnowledge.entries()].map(([id,relatedQuestions])=>{
 const question=questions.find(item=>item.knowledgePointId===id);
 const confusionGroup=questions.filter(item=>item.id!==question.id&&item.target===question.target).map(item=>item.knowledgePointId);
 return Object.freeze({id,character:question.target,term:question.stem,category:question.type,relatedQuestions:Object.freeze(relatedQuestions),confusionGroup:Object.freeze([...new Set(confusionGroup)]),memoryWallSet:question.memoryWall?.set||null,specificImage:question.specificImage||null});
}));
