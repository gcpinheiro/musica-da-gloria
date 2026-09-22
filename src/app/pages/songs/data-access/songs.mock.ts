import { Song } from '../models/song.model';

export const SONGS_MOCK: readonly Song[] = [
  {
    id: 'song-008',
    title: 'Caminho de Luz',
    author: 'Composição demonstrativa · Música da Glória',
    defaultKey: 'G',
    liturgicalMoments: ['Entrada', 'Envio'],
    active: true,
    lyrics: `[Estrofe 1]\nQuando a manhã desperta sobre a cidade\nTeu sopro reúne o povo em oração\nCada voz traz consigo a própria história\nE encontra em tua casa um só coração\n\n[Refrão]\nVem, Senhor, caminhar ao nosso lado\nFaz da nossa canção sinal do teu amor\nSomos povo reunido e renovado\nPara o mundo anunciar a tua luz\n\n[Estrofe 2]\nQuando a esperança parece tão distante\nTua palavra ilumina o nosso chão\nPartilhando o pão, seguimos confiantes\nAprendendo a servir cada irmão\n\n[Ponte]\nNossa voz, nosso dom e nossa vida\nSejam sempre instrumentos em tuas mãos\n\n[Refrão]\nVem, Senhor, caminhar ao nosso lado\nFaz da nossa canção sinal do teu amor\nSomos povo reunido e renovado\nPara o mundo anunciar a tua luz`,
    chords: `[Intro]\nG  D/F#  Em7  C9\n\n[Estrofe 1]\nG                 D/F#\nQuando a manhã desperta sobre a cidade\nEm7                         C9\nTeu sopro reúne o povo em oração\nG                         D/F#\nCada voz traz consigo a própria história\nEm7                          C9\nE encontra em tua casa um só coração\n\n[Refrão]\nC9               D\nVem, Senhor, caminhar ao nosso lado\nBm7                         Em7\nFaz da nossa canção sinal do teu amor\nC9                    G/B\nSomos povo reunido e renovado\nAm7                         D\nPara o mundo anunciar a tua luz\n\n[Estrofe 2]\nG                           D/F#\nQuando a esperança parece tão distante\nEm7                         C9\nTua palavra ilumina o nosso chão\nG                          D/F#\nPartilhando o pão, seguimos confiantes\nEm7                         C9\nAprendendo a servir cada irmão\n\n[Ponte]\nAm7                         Em7\nNossa voz, nosso dom e nossa vida\nC9                              D\nSejam sempre instrumentos em tuas mãos\n\n[Refrão]\nC9               D\nVem, Senhor, caminhar ao nosso lado\nBm7                         Em7\nFaz da nossa canção sinal do teu amor\nC9                    G/B\nSomos povo reunido e renovado\nAm7                    D        G\nPara o mundo anunciar a tua luz`,
  },
  {
    id: 'song-007', title: 'Terra Seca', author: 'Ir. Samuel Maria · Fraternidade São João Paulo II', defaultKey: 'G',
    liturgicalMoments: ['Adoração', 'Comunhão', 'Oração'], active: true,
    lyrics: 'Somente em Ti construirei a minha casa.\n[Inserir a letra integral autorizada pela pastoral.]',
    chords: `[Intro]\nC  D  Bm  Em\nC  Am  D\n\n[Estrofe]\nG       G/B             C9\nSomente em Ti construirei a minha casa\nG       G/B             C9\n[continuação da estrofe]\n\n[Pré-refrão]\nEm7  D\nG/B  C\nD    G\n\n[Refrão]\nC  D/C\nBm  Em7\nAm7  D\nG\n\n[Letra integral: inserir conteúdo autorizado pela pastoral]`,
  },
  { id: 'song-001', title: 'Eis-me Aqui, Senhor', author: 'Litúrgica tradicional', defaultKey: 'G', liturgicalMoments: ['Entrada', 'Envio'], active: true, lyrics: 'Eis-me aqui, Senhor!\nEis-me aqui, Senhor!\nPara fazer tua vontade, para viver do teu amor.', chords: 'G        D/F#     Em\nEis-me aqui, Senhor!\nC        Am       D\nPara fazer tua vontade' },
  { id: 'song-002', title: 'Kyrie Eleison', author: 'Comunidade católica', defaultKey: 'Em', liturgicalMoments: ['Ato penitencial'], active: true, lyrics: 'Senhor, que viestes salvar\nos corações arrependidos.\nKyrie eleison.', chords: 'Em             C\nSenhor, que viestes salvar\nAm       B7   Em\nKyrie eleison' },
  { id: 'song-003', title: 'Glória a Deus nas Alturas', author: 'Hinário litúrgico', defaultKey: 'D', liturgicalMoments: ['Glória'], active: true, lyrics: 'Glória a Deus nas alturas\ne paz na terra aos homens por Ele amados.', chords: 'D              G\nGlória a Deus nas alturas\nA                 D\ne paz na terra aos homens' },
  { id: 'song-004', title: 'Aleluia', author: 'Aclamação litúrgica', defaultKey: 'A', liturgicalMoments: ['Aclamação'], active: true, lyrics: 'Aleluia, aleluia!\nA minha alma abrirei.', chords: 'A       E\nAleluia, aleluia!\nD       E       A\nA minha alma abrirei' },
  { id: 'song-005', title: 'Tão Sublime Sacramento', author: 'Tradicional', defaultKey: 'C', liturgicalMoments: ['Adoração'], active: true, lyrics: 'Tão sublime sacramento\nadoremos neste altar.', chords: 'C        G       C\nTão sublime sacramento\nF       C  G    C\nadoremos neste altar' },
  { id: 'song-006', title: 'Reunidos Aqui', author: 'Canção pastoral', defaultKey: 'D', liturgicalMoments: ['Entrada'], active: true, lyrics: 'Reunidos aqui, só pra louvar ao Senhor.', chords: 'D              G\nReunidos aqui, só pra louvar\nA                 D\nao Senhor' },
];
