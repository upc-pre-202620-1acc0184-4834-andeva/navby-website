import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

for (const locale of ['es', 'en'] as const) {
  test.describe(`landing /${locale}/`, () => {
    test('hero muestra el titular y el CTA principal', async ({ page }) => {
      await page.goto(`/${locale}/`);
      const h1 = page.getByRole('heading', { level: 1 });
      await expect(h1).toContainText(locale === 'es' ? 'El mejor vuelo.' : 'The best flight.');
      await expect(
        page
          .getByRole('link', {
            name: locale === 'es' ? /Planificar mi próximo vuelo/ : /Plan my next flight/,
          })
          .first(),
      ).toBeVisible();
    });

    test('sin violaciones WCAG 2.1 AA', async ({ page }) => {
      await page.emulateMedia({ reducedMotion: 'reduce' });
      await page.goto(`/${locale}/`);
      const results = await new AxeBuilder({ page })
        .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
        .analyze();
      expect(results.violations.map((v) => `${v.id}: ${v.nodes.length}`)).toEqual([]);
    });
  });
}

test('la raíz redirige al español', async ({ page }) => {
  await page.goto('/');
  await expect(page).toHaveURL(/\/es\/?$/);
});

test('el selector de moneda cambia los precios', async ({ page }) => {
  await page.goto('/es/#precios');
  const usd = page.getByRole('button', { name: 'USD' });
  await usd.scrollIntoViewIfNeeded();
  await usd.click();
  await expect(usd).toHaveAttribute('aria-pressed', 'true');
  await expect(page.locator('#precios')).toContainText('$');
  await expect(page.locator('#precios')).toContainText('2');
});

test('el menú móvil abre y cierra con Escape', async ({ page }, info) => {
  test.skip(info.project.name !== 'mobile', 'solo móvil');
  await page.goto('/es/');
  const toggle = page.locator('[data-menu-toggle]');
  await toggle.click();
  await expect(page.locator('#mobile-menu')).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(page.locator('#mobile-menu')).toBeHidden();
});
