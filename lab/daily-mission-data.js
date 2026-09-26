export const missionPlan=Object.freeze([
 {role:'warmup',label:'🌱 暖身任務',count:1},
 {role:'challenge',label:'📘 今日挑戰',count:2},
 {role:'review',label:'🔁 複習任務',count:1},
 {role:'confusion',label:'🎯 混淆挑戰',count:1}
]);

const item=(id,kind,source,question,options,correct,explanation,image,memoryWall=null,rescue=null)=>Object.freeze({id,kind,source,question,options:Object.freeze(options),correct,explanation,image,memoryWall,rescue});

export const questionPool=Object.freeze([
 item('bianzhou','字音','一葉「扁」舟','「扁」怎麼念？',['ㄅㄧㄢˇ','ㄆㄧㄢ','ㄅㄧㄢ','ㄆㄧㄢˇ'],1,'「扁舟」是小船，「扁」念 ㄆㄧㄢ。','/themes/spy-family/q6.png',{set:'001'}),
 item('guan','字音','羽扇「綸」巾','「綸」怎麼念？',['ㄌㄨㄣˊ','ㄍㄨㄢ','ㄍㄨㄣ','ㄌㄨㄣˇ'],1,'「綸」在「羽扇綸巾」中念 ㄍㄨㄢ。','/themes/spy-family/set-004/q1.png',{set:'004'}),
 item('zao','字義','青紅「皂」白','「皂」是什麼意思？',['灰色','黑色','棕色','深藍色'],1,'「皂」在「青紅皂白」中是黑色。','/themes/spy-family/set-005/q3.png',{set:'005'}),
 item('qian','字形','派兵「ㄑㄧㄢˇ」將','應填入哪一個字？',['遣','譴','潛','淺'],0,'派兵遣將的「遣」是派遣、差派。','/themes/spy-family/set-003/q6.png',{set:'003'}),
 item('gong','字音','供奉／供應','哪一組讀音正確？',['供奉 ㄍㄨㄥ、供應 ㄍㄨㄥˋ','供奉 ㄍㄨㄥˋ、供應 ㄍㄨㄥ','兩個都念 ㄍㄨㄥ','兩個都念 ㄍㄨㄥˋ'],1,'「供」會因詞語不同改變讀音。',null,null,{title:'供奉／供應',lines:['供奉　供：ㄍㄨㄥˋ','供應　供：ㄍㄨㄥ'],tip:'同一個「供」會因詞語不同而改變讀音。'}),
 item('yang','字形','商店打「ㄧㄤˊ」','應填入哪一個字？',['洋','揚','烊','陽'],2,'打烊就是商店停止營業、關門。','/themes/spy-family/set-003/q1.png',{set:'003'}),
 item('gai','字音','言簡意「賅」','「賅」怎麼念？',['ㄏㄞˊ','ㄍㄞ','ㄎㄜˊ','ㄏㄞˋ'],1,'言簡意賅的「賅」念 ㄍㄞ。','/themes/spy-family/set-004/q6.png',{set:'004'}),
 item('bi','字形','大有「ㄅㄧˋ」益','應填入哪一個字？',['裨','脾','啤','碑'],0,'大有裨益表示有很大的幫助。','/themes/spy-family/set-002/q2.png',{set:'002'}),
 item('xiang','字形','發放軍「ㄒㄧㄤˇ」','應填入哪一個字？',['響','享','餉','想'],2,'軍餉是發給軍人的薪資或糧食。','/themes/spy-family/set-002/q3.png',{set:'002'}),
 item('yu-shape','字形','覬「ㄩˊ」之心','應填入哪一個字？',['愉','逾','覦','瑜'],2,'覬覦是想得到原本不屬於自己的東西。','/themes/spy-family/set-002/q4.png',{set:'002'}),
 item('yu-time','字音','「逾」時不補','「逾」怎麼念？',['ㄩˊ','ㄩˋ','ㄩ','ㄩˇ'],0,'「逾」是超過、越過，念 ㄩˊ。','/themes/spy-family/set-003/q7.png',{set:'003'}),
 item('an','字音','不「諳」世事','「諳」怎麼念？',['ㄧㄣ','ㄢ','ㄢˋ','ㄧㄣˇ'],1,'「諳」是熟悉、了解，念 ㄢ。','/themes/spy-family/set-004/q4.png',{set:'004'}),
 item('ling','字形','聰明「ㄌㄧㄥˊ」俐','應填入哪一個字？',['玲','伶','鈴','靈'],1,'聰明伶俐形容人機靈、反應快。','/themes/spy-family/set-004/q7.png',{set:'004'}),
 item('jue','字音','臨渴「掘」井','「掘」怎麼念？',['ㄑㄩ','ㄐㄩㄝˊ','ㄐㄩㄝˇ','ㄎㄨ'],1,'「掘」是挖，念 ㄐㄩㄝˊ。','/themes/spy-family/q5.png',{set:'001'}),
 item('zi','字義','在涅貴不「緇」','「緇」的本義是什麼？',['白色','紅色','黑色','青色'],2,'「緇」看到就想到黑色。','/themes/spy-family/set-005/q1.png',{set:'005'}),
 item('xuan','字義','「玄」端','「玄」在這裡表示什麼？',['黑色','黃色','白色','紅色'],0,'玄端是古代黑色的祭服或禮服。','/themes/spy-family/set-005/q4.png',{set:'005'}),
 item('you','字義','「黝」黑','「黝黑」最接近哪個意思？',['明亮的白','深黑或青黑','鮮紅','淡黃'],1,'黝黑是顏色很深的黑，也可帶青黑色。','/themes/spy-family/set-005/q2.png',{set:'005'}),
 item('black-gold','字義','黑金政治','這裡的「黑」是什麼用法？',['單純的顏色','不正當、陰暗的引申義','夜晚','黑色衣服'],1,'黑金的「黑」帶有不正當、陰暗的引申義。','/themes/spy-family/set-005/q5.png',{set:'005'}),
 item('black-heart','字義','黑心','「黑心」是什麼意思？',['心臟顏色黑','人心地陰險狠毒','喜歡黑色','心情難過'],1,'黑心比喻人心地陰險狠毒。','/themes/spy-family/set-005/q6.png',{set:'005'}),
 item('smear','字義','抹黑','「抹黑」是什麼意思？',['塗黑牆壁','醜化或歪曲事實','關掉燈光','畫黑色圖案'],1,'抹黑比喻醜化或歪曲事實，使形象變差。','/themes/spy-family/set-005/q7.png',{set:'005'}),
 item('lei','字音','危如「累」卵','「累」怎麼念？',['ㄌㄟˋ','ㄌㄟˊ','ㄌㄟˇ','ㄌㄩˇ'],2,'危如累卵的「累」是堆疊，念 ㄌㄟˇ。','/themes/spy-family/set-002/q1.png',{set:'002'}),
 item('die','字形','「ㄉㄧㄝˊ ㄉㄧㄝˊ」不休','應填入哪一組字？',['諜諜','喋喋','蝶蝶','牒牒'],1,'喋喋不休是不停地說話。','/themes/spy-family/q2.png',{set:'001'}),
 item('xia','字音','個性狡「黠」','「黠」怎麼念？',['ㄐㄧㄝˊ','ㄒㄧㄚˊ','ㄒㄧㄝˊ','ㄐㄧㄚˊ'],1,'「黠」是聰明而帶有狡猾，念 ㄒㄧㄚˊ。','/themes/spy-family/q4.png',{set:'001'}),
 item('tuo','字音','「唾」手可得','「唾」怎麼念？',['ㄔㄨㄟˊ','ㄊㄨㄛˋ','ㄉㄨㄛˋ','ㄊㄨㄟˋ'],1,'唾手可得的「唾」念 ㄊㄨㄛˋ。','/themes/spy-family/set-002/q6.png',{set:'002'}),
 item('yang-pretend','字形','詐啞「ㄧㄤˊ」聾','應填入哪一個字？',['洋','佯','揚','楊'],1,'「佯」是假裝，詐啞佯聾是故意裝作不知道。','/themes/spy-family/set-002/q7.png',{set:'002'})
]);

export const dailyMissionIds=Object.freeze(['bianzhou','guan','zao','qian','gong']);
export const missionRoles=Object.freeze(['🌱 暖身','📘 今日挑戰','📘 今日挑戰','🔁 今日複習','🎯 混淆挑戰']);
