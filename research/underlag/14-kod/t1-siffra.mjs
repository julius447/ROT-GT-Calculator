import { siffra, formatFalt, kr, beraknaHushall, berakna, MAX_PERSONER, TAK } from '/Users/juliuscallahan/Desktop/Claude Code/rot-gt-calculator/kalkylator/rakna.js';
const cases = ['300.000', '300 000 kr', '1,2 miljoner', '1e15', '1000000000000000', '12345678901234567890', '٣٠٠', '３００', '-5000', '300,50', '0', '', null, undefined, '  42  ', '1 200 000', '2.5', '99999999999999999999999'];
for (const c of cases) {
  const n = siffra(c);
  console.log(String(JSON.stringify(c)).padEnd(28), '->', String(n).padEnd(26), 'formatFalt:', JSON.stringify(formatFalt(c)), 'kr():', JSON.stringify(kr(n)));
}
console.log('\n--- hushåll edge cases ---');
console.log(JSON.stringify(beraknaHushall({ mode:'rot', ager:true, aldre:true, personer:[{typ:'lon', alder:'18-65', inkomst: 1e15, pension:0, ranta:0, anvant:0, gtAnvant:0}] })));
console.log(JSON.stringify(beraknaHushall({ mode:'rot', ager:true, aldre:true, personer:[{typ:'lon', alder:'18-65', inkomst: 12345678901234567890, pension:0, ranta:0, anvant:0, gtAnvant:0}] })));
console.log(JSON.stringify(beraknaHushall({ mode:'rot', ager:true, aldre:true, personer:[{typ:'lon', alder:'18-65', inkomst: 300000, pension:0, ranta:0, anvant: 1e15, gtAnvant:0}] })));
console.log(JSON.stringify(beraknaHushall({ mode:'rot', ager:true, aldre:true, personer:[{typ:'lon', alder:'18-65', inkomst: 300000, pension:0, ranta:1e15, anvant: 0, gtAnvant:0}] })));
console.log(JSON.stringify(beraknaHushall({ mode:'gt', ager:true, aldre:true, personer:[{typ:'bada', alder:'66+', inkomst: 300000, pension:100000, ranta:0, anvant: 0, gtAnvant:20000}] })));
console.log(JSON.stringify(beraknaHushall({ mode:'rot', ager:true, aldre:true, personer:[] })));
console.log(JSON.stringify(beraknaHushall({ mode:'rot', ager:true, aldre:true, personer:[{typ:'lon', alder:'u18', inkomst: 0}] })));
console.log(JSON.stringify(beraknaHushall({ mode:'rot', ager:true, aldre:true, personer:[{typ:'lon', alder:'18-65', inkomst: 0},{typ:'lon', alder:'u18', inkomst: 0}] })));
console.log(JSON.stringify(beraknaHushall({ mode:'rot', ager:true, aldre:false, personer:[{typ:'lon', alder:'18-65', inkomst: 0, anvant: 60000}] })));
console.log('MAX_PERSONER', MAX_PERSONER, 'TAK', TAK);
console.log('kr(0)', JSON.stringify(kr(0)), 'kr(50000) codepoints', [...kr(50000)].map(c=>c.codePointAt(0).toString(16)).join(' '));
