import fs from 'fs';

const path = 'src/data/mock.ts';
let src = fs.readFileSync(path, 'utf8');

/** Sinopsis cortas (ES) para mocks sin `notes`. */
const SYNOPSES = {
  'm_11':
    'Una granja en un planeta desértico guarda el destino de la galaxia cuando un joven granjero se une a la Rebelión contra el Imperio.',
  'm_438631':
    'Paul Atreides viaja al planeta Arrakis, único productor de la especia melange, y se enfrenta a traiciones, política y una profecía.',
  'm_496243':
    'Dos familias de Seúl —una en la miseria y otra en la opulencia— cruzan sus destinos en una sátira social de tensión creciente.',
  'm_329865':
    'Una lingüista intenta comunicarse con visitantes alienígenas y descubre que el lenguaje puede reescribir la percepción del tiempo.',
  'b_isbn_9780553293357':
    'Hari Seldon predice la caída del Imperio Galáctico y pone en marcha la Fundación para acortar la edad oscura que se avecina.',
  'b_isbn_9780441569595':
    'Case, un vaquero de la matriz, acepta un último trabajo en el ciberespacio que lo arrastra al corazón del ciberpunk.',
  'm_70160':
    'En un futuro distópico, Katniss Everdeen se ofrece como tributo en los Juegos del Hambre para salvar a su hermana y desafiar al Capitolio.',
  'm_8966':
    'Bella Swan se muda a Forks y se enamora de Edward Cullen, un misterioso estudiante que esconde un secreto imposible.',
  'm_671':
    'Harry Potter descubre que es un mago y entra en Hogwarts, donde enfrenta el legado de Lord Voldemort y encuentra su verdadera familia.',
  'm_122':
    'La Comunidad se desintegra y Frodo avanza hacia Mordor mientras Aragorn asume su destino como rey en la batalla final contra Sauron.',
  'm_11036':
    'Un hombre lee a una mujer en coma la historia de un amor de verano que marcó sus vidas décadas atrás.',
  'm_13':
    'Forrest Gump, un hombre de corazón puro, atraviesa décadas de historia estadounidense sin dejar de ser fiel a quienes ama.',
  'm_680':
    'Historias entrelazadas de criminales en Los Ángeles, contadas fuera de orden, con diálogos afilados y violencia estilizada.',
  'm_77':
    'Un hombre con amnesia anterógrada busca al asesino de su esposa tatuando pistas en el cuerpo para no olvidar.',
  'm_424':
    'Oskar Schindler salva a más de mil judíos del Holocausto empleándolos en su fábrica durante la Segunda Guerra Mundial.',
  'm_98':
    'Máximo, general romano traicionado, se convierte en gladiador y busca venganza contra el emperador que destruyó su familia.',
  'm_597':
    'Jack y Rose se conocen a bordo del Titanic; su romance desafía clases sociales mientras el barco se dirige al desastre.',
  'm_313369':
    'Una actriz y un músico se enamoran en Los Ángeles mientras persiguen sueños que pueden separarlos.',
  'm_114':
    'Un empresario contrata a una acompañante para una semana de negocios y ambos descubren que quieren algo más.',
  'm_508':
    'Varias historias de amor se entrelazan en Londres en las semanas previas a la Navidad.',
  'm_1417':
    'En la España de la posguerra, una niña escapa a un laberinto fantástico donde un fauno le propone tres pruebas.',
  'm_411':
    'Cuatro hermanos cruzan un armario hacia Narnia, un mundo mágico gobernado por la Bruja Blanca y aguardado por Aslan.',
  'm_259316':
    'El magizoólogo Newt Scamander llega a Nueva York con una maleta de criaturas mágicas que pronto se escapan.',
  'm_121':
    'Frodo y Sam continúan hacia Mordor mientras la guerra por la Tierra Media se intensifica en Rohan y Helm\'s Deep.',
  'm_274':
    'La agente Starling necesita la ayuda del brillante y peligroso Hannibal Lecter para atrapar a otro asesino en serie.',
  'm_807':
    'Dos detectives persiguen a un asesino que elige a sus víctimas según los siete pecados capitales.',
  'm_210577':
    'Cuando la esposa de Nick Dunne desaparece, las sospechas y las medias verdades convierten el matrimonio en un laberinto.',
  'm_11324':
    'Un marshal investiga la desaparición de una paciente en un hospital psiquiátrico de una isla y enfrenta su propio pasado.',
  'm_222935':
    'Dos adolescentes con cáncer se enamoran y emprenden un viaje que redefine lo que significa vivir con intensidad.',
  'm_157350':
    'En una sociedad dividida en facciones, Tris descubre que no encaja en ninguna y se enfrenta al sistema que la oprime.',
  'm_198663':
    'Thomas despierta en un laberinto sin memoria y debe unirse a otros jóvenes para escapar de un experimento mortal.',
  'm_32657':
    'Percy Jackson descubre que es hijo de Poseidón y debe recuperar el rayo de Zeus para evitar una guerra entre dioses.',
  'm_101299':
    'Katniss y Peeta vuelven a la arena en los Juegos del Hambre de los Vencedores mientras la rebelión prende en los distritos.',
};

// Insert notes before status/addedAt when missing for known ids
for (const [id, text] of Object.entries(SYNOPSES)) {
  const idIdx = src.indexOf(`id: '${id}'`);
  if (idIdx < 0) {
    console.log('missing id', id);
    continue;
  }
  const blockEnd = src.indexOf('\n  },', idIdx);
  const block = src.slice(idIdx, blockEnd);
  if (/notes:\s*'/.test(block)) {
    console.log('skip (has notes)', id);
    continue;
  }
  const escaped = text.replace(/\\/g, '\\\\').replace(/'/g, "\\'");
  const insertAt = block.search(/\n\s*status:/);
  if (insertAt < 0) {
    console.log('no status', id);
    continue;
  }
  const newBlock =
    block.slice(0, insertAt) +
    `\n    notes: '${escaped}',` +
    block.slice(insertAt);
  src = src.slice(0, idIdx) + newBlock + src.slice(blockEnd);
  console.log('added', id);
}

fs.writeFileSync(path, src);
console.log('done');
