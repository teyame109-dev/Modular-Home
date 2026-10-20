# Quita el velo oscuro y el texto de las capturas de nevolahomes.com.
# Relleno direccional: para cada píxel tapado por letra interpola en horizontal, vertical
# y en las dos diagonales entre los píxeles limpios más cercanos y elige la dirección
# cuyos extremos se parecen más (respeta aristas rectas de fachada y carpinterías).
import cv2, numpy as np, sys
def run(src, dst):
    im = cv2.imread(src).astype(np.float32)
    mask = cv2.dilate((im.max(2) > 150).astype(np.uint8), np.ones((3,3),np.uint8), iterations=2).astype(bool)
    lit = np.clip(im / 0.6, 0, 255)
    H, W = mask.shape
    ys, xs = np.nonzero(mask)
    best = np.full(len(ys), 1e9); val = np.zeros((len(ys),3))
    for dy, dx in [(0,1),(1,0),(1,1),(1,-1)]:
        # distancia hasta el primer píxel limpio en +d y en -d
        def walk(sy, sx):
            cy, cx = ys.copy(), xs.copy(); n = np.zeros(len(ys), int)
            alive = np.ones(len(ys), bool)
            for step in range(60):
                ny, nx = cy + sy*alive, cx + sx*alive
                ok = (ny>=0)&(ny<H)&(nx>=0)&(nx<W)
                ny = np.clip(ny,0,H-1); nx = np.clip(nx,0,W-1)
                cy, cx = np.where(alive, ny, cy), np.where(alive, nx, cx)
                n += alive
                alive = alive & ok & mask[cy, cx]
                if not alive.any(): break
            good = ~mask[cy, cx]
            return cy, cx, n, good
        ay, ax, na, ga = walk(dy, dx); by, bx, nb, gb = walk(-dy, -dx)
        A, B = lit[ay, ax], lit[by, bx]
        t = (nb / (na + nb))[:, None]
        v = B*(1-t) + A*t
        cost = np.abs(A-B).sum(1) + 0.4*(na+nb)
        cost[~(ga & gb)] = 1e8
        upd = cost < best
        best[upd] = cost[upd]; val[upd] = v[upd]
    out = lit.copy(); out[ys, xs] = val
    out = out.astype(np.uint8)
    # suaviza solo lo reparado
    m = cv2.GaussianBlur(mask.astype(np.float32), (5,5), 0)[...,None]
    sm = cv2.medianBlur(out, 3)
    out = (out*(1-m*0.6) + sm*(m*0.6)).astype(np.uint8)
    cv2.imwrite(dst, out, [cv2.IMWRITE_JPEG_QUALITY, 86])

# Uso (desde la raíz del repo): python3 herramientas/render/limpia_renders.py
# Lee las capturas de proyectos-referencia/nevola-renders/ y deja los renders limpios en web/site/render/img/
# Necesita: pip install opencv-python-headless
import os
SRC, DST = 'proyectos-referencia/nevola-renders', 'web/site/render/img'
for f in sorted(os.listdir(SRC)):
    if f.startswith('captura-') and f.endswith('.webp') and not f.endswith('-b.webp'):
        run(os.path.join(SRC, f), os.path.join(DST, f[len('captura-'):-5] + '.jpg'))
        print('ok', f)
