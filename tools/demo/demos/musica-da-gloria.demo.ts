import { expect, focusRing, showConfetti, showOverlay, test } from '@argo-video/cli';

test.setTimeout(300_000);

test('musica-da-gloria', async ({ page, narration }) => {
  await page.route('**/*', async (route) => {
    const url = new URL(route.request().url());
    if (url.hostname === '127.0.0.1' || url.hostname === 'localhost' || url.protocol === 'data:') {
      await route.continue();
      return;
    }
    await route.abort('blockedbyclient');
  });

  const pauseAfterAction = async (ms = 700) => page.waitForTimeout(ms);

  await page.goto('/login');
  await page.getByLabel('E-mail').fill('lider@musicadagloria.org.br');
  await page.getByLabel('Senha').fill('gloria2026');
  await page.getByRole('button', { name: 'Entrar' }).click();
  await expect(page).toHaveURL(/\/dashboard$/);
  await expect(page.getByRole('heading', { name: /Paz e bem, Gabriel!/ })).toBeVisible();

  await narration.startRecording(page);

  narration.mark('abertura');
  await showOverlay(page, 'abertura', narration.durationFor('abertura', { minMs: 6500 }));

  narration.mark('navegar_escalas');
  await page.getByRole('link', { name: 'Escalas', exact: true }).click();
  await expect(page.getByRole('heading', { name: 'Escalas', exact: true })).toBeVisible();
  await focusRing(page, '.header-actions', { color: '#C5A35A', duration: 900 });
  await page.getByRole('link', { name: /Nova escala/ }).click();
  await expect(page.getByRole('heading', { name: 'Criar escalas' })).toBeVisible();
  await page.waitForTimeout(narration.durationFor('navegar_escalas', { minMs: 6500 }));

  narration.mark('dados_celebracao');
  await page.getByLabel('Ministério').selectOption('min-santa-cecilia');
  await pauseAfterAction();
  await page.locator('#slot-date-0').fill('2026-11-08');
  await pauseAfterAction(450);
  await page.locator('#slot-time-0').fill('18:30');
  const celebrationName = page.locator('#slot-title-0');
  await celebrationName.fill('');
  await celebrationName.pressSequentially('Santa Missa Dominical', { delay: 45 });
  await page.locator('#slot-location-0').selectOption('Igreja Matriz');
  const liturgicalTime = page.locator('#slot-liturgical-time-0');
  await liturgicalTime.fill('');
  await liturgicalTime.pressSequentially('32º Domingo do Tempo Comum', { delay: 35 });
  const notes = page.locator('#slot-notes-0');
  await notes.pressSequentially('Chegada às 17h45 para passagem de som e oração.', { delay: 24 });
  await focusRing(page, '.slot-row', { color: '#C5A35A', duration: 900 });
  await page.waitForTimeout(narration.durationFor('dados_celebracao', { minMs: 8500 }));

  const participantsSection = page.locator('section.form-section').filter({ hasText: 'Participantes desta escala' });
  narration.mark('participantes');
  await participantsSection.scrollIntoViewIfNeeded();
  await expect(participantsSection.locator('.selected-panel li')).toHaveCount(3);
  const camilaChoice = participantsSection.locator('label.choice').filter({ hasText: 'Camila Sousa' });
  await camilaChoice.getByRole('checkbox').check();
  await expect(participantsSection.locator('.selected-panel li')).toHaveCount(4);
  await focusRing(page, participantsSection.locator('.selected-panel'), { color: '#C5A35A', duration: 1000 });
  await page.waitForTimeout(narration.durationFor('participantes', { minMs: 7500 }));

  const repertoireSection = page.locator('section.form-section').filter({ hasText: 'Repertório' });
  narration.mark('repertorio_formulario');
  await repertoireSection.scrollIntoViewIfNeeded();
  for (const title of ['Eis-me Aqui, Senhor', 'Glória a Deus nas Alturas', 'Aleluia', 'Terra Seca']) {
    const choice = repertoireSection.locator('label.choice').filter({ hasText: title });
    await choice.getByRole('checkbox').check();
    await pauseAfterAction(420);
  }
  await expect(repertoireSection.locator('.selected-panel li')).toHaveCount(4);
  await repertoireSection.getByRole('button', { name: 'Mover Terra Seca para cima' }).click();
  await pauseAfterAction(450);
  await repertoireSection.getByRole('button', { name: 'Mover Terra Seca para cima' }).click();
  await focusRing(page, repertoireSection.locator('.selected-panel'), { color: '#C5A35A', duration: 1000 });
  await page.waitForTimeout(narration.durationFor('repertorio_formulario', { minMs: 9000 }));

  narration.mark('criar_escala');
  const submitButton = page.getByRole('button', { name: 'Criar 1 escala(s)' });
  await submitButton.scrollIntoViewIfNeeded();
  await focusRing(page, submitButton, { color: '#C5A35A', duration: 800 });
  await submitButton.click();
  await expect(page).toHaveURL(/\/escalas\/occ-/);
  await expect(page.locator('.schedule-header')).toBeVisible();
  await focusRing(page, '.facts', { color: '#C5A35A', duration: 900 });
  await page.waitForTimeout(narration.durationFor('criar_escala', { minMs: 7000 }));

  narration.mark('detalhes_escala');
  const formation = page.locator('section.panel').filter({ hasText: 'Formação desta escala' });
  await formation.scrollIntoViewIfNeeded();
  await focusRing(page, formation, { color: '#C5A35A', duration: 900 });
  const detailRepertoire = page.locator('section.panel').filter({ hasText: 'Repertório' });
  await detailRepertoire.scrollIntoViewIfNeeded();
  await focusRing(page, detailRepertoire, { color: '#C5A35A', duration: 900 });
  await page.waitForTimeout(narration.durationFor('detalhes_escala', { minMs: 8000 }));

  narration.mark('editar_vozes');
  await detailRepertoire.getByRole('link', { name: 'Ver cifra' }).first().click();
  await expect(page.locator('.song-reader')).toBeVisible();
  await page.getByRole('tab', { name: 'Letra', exact: true }).click();
  await page.getByRole('button', { name: /Editar letra desta escala/ }).click();
  const editor = page.locator('.lyrics-editor__surface');
  await expect(editor).toBeVisible();
  await editor.evaluate((element) => {
    const walker = document.createTreeWalker(element, NodeFilter.SHOW_TEXT);
    const textNode = walker.nextNode();
    if (!textNode) return;
    const range = document.createRange();
    range.setStart(textNode, 0);
    range.setEnd(textNode, Math.min(55, textNode.textContent?.length ?? 0));
    const selection = document.getSelection();
    selection?.removeAllRanges();
    selection?.addRange(range);
    (element as HTMLElement).focus();
  });
  await page.getByRole('button', { name: 'Mulheres' }).click();
  await pauseAfterAction(700);
  await page.getByRole('button', { name: 'Salvar arranjo' }).click();
  await expect(page.locator('.voice-legend')).toBeVisible();
  await focusRing(page, '.voice-legend', { color: '#C5A35A', duration: 900 });
  await page.waitForTimeout(narration.durationFor('editar_vozes', { minMs: 9500 }));

  narration.mark('experiencia_usuario');
  const scheduleBreadcrumb = page.locator('.breadcrumb a').filter({ hasText: 'Santa Missa Dominical' });
  await scheduleBreadcrumb.click();
  await expect(page.locator('.schedule-header')).toBeVisible();
  const userRepertoire = page.locator('section.panel').filter({ hasText: 'Repertório' });
  await userRepertoire.scrollIntoViewIfNeeded();
  await userRepertoire.getByRole('link', { name: 'Abrir repertório' }).click();
  await expect(page.locator('.song-pagination')).toBeVisible();
  await focusRing(page, '.song-pagination', { color: '#C5A35A', duration: 900 });
  await page.waitForTimeout(narration.durationFor('experiencia_usuario', { minMs: 8500 }));

  narration.mark('cifra_tela_cheia');
  await page.getByRole('tab', { name: 'Letra com cifra' }).click();
  await page.getByRole('button', { name: /Expandir/ }).click();
  await expect(page.locator('.song-reader--expanded')).toBeVisible();
  await page.getByRole('button', { name: 'Aumentar tamanho da letra' }).click();
  await page.getByRole('button', { name: /Autorrolagem/ }).click();
  await focusRing(page, '.reader-toolbar', { color: '#C5A35A', duration: 900 });
  await page.waitForTimeout(narration.durationFor('cifra_tela_cheia', { minMs: 9500 }));

  narration.mark('encerramento');
  await showConfetti(page, {
    duration: 2600,
    pieces: 70,
    colors: ['#173C67', '#4B83B6', '#C5A35A', '#F7F5F0'],
  });
  await showOverlay(page, 'encerramento', narration.durationFor('encerramento', { minMs: 7500 }));
});
