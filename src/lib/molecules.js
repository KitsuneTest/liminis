const DEG = Math.PI / 180
const ANGLES_HEXAGONE = [90, 30, -30, -90, -150, 150]

function constructeur() {
  const atomes = []
  const liaisons = []
  const ajouter = (e, x, y, z = 0) => atomes.push({ e, x, y, z }) - 1
  const lier = (a, b, ordre = 1) => liaisons.push({ a, b, ordre })
  const greffer = (i, e, angle, longueur = 1, ordre = 1) => {
    const a = atomes[i]
    const j = ajouter(e, a.x + Math.cos(angle * DEG) * longueur, a.y + Math.sin(angle * DEG) * longueur, a.z)
    lier(i, j, ordre)
    return j
  }
  const hydroxyle = (i, angle, coude = 55) => {
    const o = greffer(i, 'O', angle)
    greffer(o, 'H', angle + coude, 0.6)
    return o
  }
  const cycle = (indices, ordres) =>
    indices.forEach((a, k) => lier(a, indices[(k + 1) % indices.length], ordres[k]))
  return { atomes, liaisons, ajouter, lier, greffer, hydroxyle, cycle }
}

const sommetsHexagone = (cx, cy) =>
  ANGLES_HEXAGONE.map((d) => ({ x: cx + Math.cos(d * DEG), y: cy + Math.sin(d * DEG) }))

function polygoneSurArete(p, q, n) {
  const angle = (2 * Math.PI) / n
  let dx = q.x - p.x
  let dy = q.y - p.y
  let courant = q
  const points = []
  for (let i = 0; i < n - 2; i++) {
    ;[dx, dy] = [dx * Math.cos(angle) - dy * Math.sin(angle), dx * Math.sin(angle) + dy * Math.cos(angle)]
    courant = { x: courant.x + dx, y: courant.y + dy }
    points.push(courant)
  }
  return points
}

function cyanidine() {
  const m = constructeur()
  const A = sommetsHexagone(0, 0).map((p) => m.ajouter('C', p.x, p.y))
  m.cycle(A, [1, 2, 1, 2, 1, 2])

  const c = sommetsHexagone(Math.sqrt(3), 0)
  const O1 = m.ajouter('O', c[0].x, c[0].y)
  const C2 = m.ajouter('C', c[1].x, c[1].y)
  const C3 = m.ajouter('C', c[2].x, c[2].y)
  const C4 = m.ajouter('C', c[3].x, c[3].y)
  m.cycle([A[1], O1, C2, C3, C4, A[2]], [1, 2, 1, 2, 1, 2])

  const centreB = { x: c[1].x + 2 * Math.cos(30 * DEG), y: c[1].y + 2 * Math.sin(30 * DEG) }
  const B = sommetsHexagone(centreB.x, centreB.y).map((p) => m.ajouter('C', p.x, p.y))
  m.cycle(B, [2, 1, 2, 1, 2, 1])
  m.lier(C2, B[4])

  m.hydroxyle(C3, -30)
  m.hydroxyle(A[3], -90)
  m.hydroxyle(A[5], 150)
  m.hydroxyle(B[0], 90)
  m.hydroxyle(B[1], 30)
  return m
}

function indole(m, cy) {
  const h = sommetsHexagone(0, cy).map((p) => m.ajouter('C', p.x, p.y))
  m.cycle(h, [2, 1, 2, 1, 2, 1])
  const [n, c2, c3] = polygoneSurArete({ x: Math.cos(30 * DEG), y: cy + 0.5 }, { x: Math.cos(30 * DEG), y: cy - 0.5 }, 5)
  const N = m.ajouter('N', n.x, n.y)
  const C2 = m.ajouter('C', c2.x, c2.y)
  const C3 = m.ajouter('C', c3.x, c3.y)
  m.lier(h[2], N)
  m.lier(N, C2)
  m.lier(C2, C3, 2)
  m.lier(C3, h[1])
  m.greffer(N, 'H', -60, 0.6)
  m.greffer(C2, 'R', 0)
  return h
}

// Pyrrole hanging from atom i, as the last unit painted on the mural: C3 on i, COOH on C2, R on C5.
function pyrrole(m, i) {
  const ancre = m.atomes[i]
  const c3 = { x: ancre.x + Math.cos(-30 * DEG), y: ancre.y + Math.sin(-30 * DEG) }
  const c2 = { x: c3.x, y: c3.y - 1 }
  const [n, c5, c4] = polygoneSurArete(c3, c2, 5)
  const C3 = m.ajouter('C', c3.x, c3.y)
  const C2 = m.ajouter('C', c2.x, c2.y)
  const N = m.ajouter('N', n.x, n.y)
  const C5 = m.ajouter('C', c5.x, c5.y)
  const C4 = m.ajouter('C', c4.x, c4.y)
  m.lier(i, C3)
  m.cycle([C3, C2, N, C5, C4], [2, 1, 1, 2, 1])
  m.greffer(N, 'H', -60, 0.6)
  m.greffer(C5, 'R', 0)
  const carboxyle = m.greffer(C2, 'C', -150)
  m.greffer(carboxyle, 'O', 150, 1, 2)
  m.hydroxyle(carboxyle, -90)
}

function eumelanine() {
  const m = constructeur()
  const u1 = indole(m, 0)
  const u2 = indole(m, -3)
  m.lier(u1[3], u2[0])

  m.greffer(u1[4], 'O', -150, 1, 2)
  m.greffer(u1[5], 'O', 150, 1, 2)
  m.hydroxyle(u2[4], -150, -55)
  m.hydroxyle(u2[5], 150)

  // As painted: the third unit is a ring-opened pyrrole, joined through a ketone bridge.
  const pont = m.greffer(u2[3], 'C', -90)
  m.greffer(pont, 'O', -150, 1, 2)
  pyrrole(m, pont)
  return m
}

function feuilletBeta() {
  const m = constructeur()
  const n = 12
  const brins = [
    { y: 1.6, roles: ['N', 'A', 'K'], dedans: -1 },
    { y: -1.6, roles: ['K', 'A', 'N'], dedans: 1 },
  ]
  const polaires = brins.map(() => [])

  brins.forEach((brin, b) => {
    let precedent = null
    for (let j = 0; j < n; j++) {
      const role = brin.roles[j % 3]
      const x = (j - (n - 1) / 2) * 0.9
      const y = brin.y + (j % 2 ? 0.28 : -0.28) * -brin.dedans
      const i = m.ajouter(role === 'N' ? 'N' : 'C', x, y)
      if (precedent !== null) m.lier(precedent, i)
      precedent = i

      const apparie = Math.floor(j / 3) % 2 === 0
      const sens = apparie ? brin.dedans : -brin.dedans
      if (role === 'K') polaires[b][j] = m.greffer(i, 'O', sens * 90, 1.05, 2)
      if (role === 'N') polaires[b][j] = m.greffer(i, 'H', sens * 90, 0.75)
      if (role === 'A') {
        const r = m.ajouter('R', x, y + brin.dedans * -0.4, (Math.floor(j / 3) + b) % 2 ? 1.1 : -1.1)
        m.lier(i, r)
      }
    }
  })

  for (let j = 0; j < n; j++) {
    if (Math.floor(j / 3) % 2 === 0 && polaires[0][j] !== undefined && polaires[1][j] !== undefined)
      m.lier(polaires[0][j], polaires[1][j], 0)
  }
  return m
}

const MOLECULES = { cyanidine, eumelanine, feuilletBeta }

export function molecule(nom) {
  const { atomes, liaisons } = MOLECULES[nom]()
  return { atomes, liaisons }
}
