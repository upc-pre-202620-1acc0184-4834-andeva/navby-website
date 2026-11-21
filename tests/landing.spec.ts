import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

const routes = {
  es: '/',
  en: '/en/',
} as const;

for (const locale of ['es', 'en'] as const) {
  const path = routes[locale];
  test.describe(`landing ${path}`, () => {
    test('hero muestra el titular y el CTA principal', async ({ page }) => {
      await page.goto(path);
      const h1 = page.getByRole('heading', { level: 1 });
      await expect(h1).toContainText(locale === 'es' ? 'El mejor vuelo.' : 'The best flight.');
      const heroCta = page
        .getByRole('link', {
          name: locale === 'es' ? /Planificar mi próximo vuelo/ : /Plan my next flight/,
        })
        .first();
      await expect(heroCta).toBeVisible();
      await expect(heroCta).toHaveAttribute('href', '/app');
    });

    test('sin violaciones WCAG 2.1 AA', async ({ page }) => {
      await page.emulateMedia({ reducedMotion: 'reduce' });
      await page.goto(path);
      const results = await new AxeBuilder({ page })
        .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
        .analyze();
      expect(results.violations.map((v) => `${v.id}: ${v.nodes.length}`)).toEqual([]);
    });
  });
}

test('la raíz carga directamente en español sin prefijo /es', async ({ page }) => {
  await page.goto('/');
  await expect(page).toHaveURL(/\/$/);
  await expect(page.locator('html')).toHaveAttribute('lang', 'es');
});

test('guarda tema e idioma en localStorage para compartir con la webapp', async ({ page }) => {
  await page.emulateMedia({ colorScheme: 'light' });
  await page.goto('/');
  await expect.poll(() => page.evaluate(() => localStorage.getItem('navby-lang'))).toBe('es');

  await page.locator('[data-theme-toggle]').first().click();
  await expect.poll(() => page.evaluate(() => localStorage.getItem('navby-theme'))).toBe('dark');
  await expect(page.locator('html')).toHaveClass(/dark/);

  await page.locator('footer a[href="/en/"]').click();
  await expect(page).toHaveURL(/\/en\/?$/);
  await expect.poll(() => page.evaluate(() => localStorage.getItem('navby-lang'))).toBe('en');
  await expect.poll(() => page.evaluate(() => localStorage.getItem('navby-theme'))).toBe('dark');
  await expect(page.locator('html')).toHaveClass(/dark/);

  await page.locator('footer a[href="/"]').click();
  await expect(page).toHaveURL(/\/$/);
  await expect.poll(() => page.evaluate(() => localStorage.getItem('navby-lang'))).toBe('es');
});

test('no sobrescribe navby-lang existente al volver al website sin cambiar idioma', async ({
  page,
}) => {
  await page.addInitScript(() => {
    localStorage.setItem('navby-lang', 'en');
  });
  await page.goto('/');
  await expect.poll(() => page.evaluate(() => localStorage.getItem('navby-lang'))).toBe('en');
});

test('los botones de precios enlazan a registro y a billing con su paquete', async ({ page }) => {
  await page.goto('/#precios');
  const section = page.locator('#precios');
  await section.scrollIntoViewIfNeeded();

  await expect(section.getByRole('link', { name: /Crear cuenta gratis/ })).toHaveAttribute(
    'href',
    '/app/register',
  );
  const packLinks = section.getByRole('link', { name: /Elegir paquete/ });
  await expect(packLinks).toHaveCount(3);
  await expect(packLinks.nth(0)).toHaveAttribute('href', '/app/billing?pack=pack_50');
  await expect(packLinks.nth(1)).toHaveAttribute('href', '/app/billing?pack=pack_100');
  await expect(packLinks.nth(2)).toHaveAttribute('href', '/app/billing?pack=pack_250');
});

test('el selector de moneda cambia los precios', async ({ page }) => {
  await page.goto('/#precios');
  const usd = page.getByRole('button', { name: 'USD' });
  await usd.scrollIntoViewIfNeeded();
  await usd.click();
  await expect(usd).toHaveAttribute('aria-pressed', 'true');
  await expect(page.locator('#precios')).toContainText('$');
  await expect(page.locator('#precios')).toContainText('2');
});

test('el menú móvil abre y cierra con Escape', async ({ page }, info) => {
  test.skip(info.project.name !== 'mobile', 'solo móvil');
  await page.goto('/');
  const toggle = page.locator('[data-menu-toggle]');
  await toggle.click();
  await expect(page.locator('#mobile-menu')).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(page.locator('#mobile-menu')).toBeHidden();
});
