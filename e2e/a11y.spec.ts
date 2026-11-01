import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

test.describe('WCAG 2.1 AA Automated Accessibility Audit (M14, FR-020)', () => {
  test('Storefront homepage (/) passes automated accessibility audit', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('domcontentloaded');

    const scanResults = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
      .analyze();

    expect(scanResults.violations).toEqual([]);
  });

  test('Shop / catalog (/shop) passes automated accessibility audit', async ({ page }) => {
    await page.goto('/shop');
    await page.waitForLoadState('domcontentloaded');

    const scanResults = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
      .analyze();

    expect(scanResults.violations).toEqual([]);
  });

  test('Product detail page (/products/strawberry-milk-carton-keychain) passes automated accessibility audit', async ({
    page,
  }) => {
    await page.goto('/products/strawberry-milk-carton-keychain');
    await page.waitForLoadState('domcontentloaded');

    const scanResults = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
      .analyze();

    expect(scanResults.violations).toEqual([]);
  });

  test('Cart view (/cart) passes automated accessibility audit', async ({ page }) => {
    await page.goto('/cart');
    await page.waitForLoadState('domcontentloaded');

    const scanResults = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
      .analyze();

    expect(scanResults.violations).toEqual([]);
  });

  test('Checkout form (/checkout) passes automated accessibility audit', async ({ page }) => {
    await page.goto('/checkout');
    await page.waitForLoadState('domcontentloaded');

    const scanResults = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
      .analyze();

    expect(scanResults.violations).toEqual([]);
  });

  test('Bespoke custom order form (/custom-order) passes automated accessibility audit', async ({ page }) => {
    await page.goto('/custom-order');
    await page.waitForLoadState('domcontentloaded');

    const scanResults = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
      .analyze();

    expect(scanResults.violations).toEqual([]);
  });

  test('Customer account portal (/account) passes automated accessibility audit', async ({ page }) => {
    await page.goto('/account');
    await page.waitForLoadState('domcontentloaded');

    const scanResults = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
      .analyze();

    expect(scanResults.violations).toEqual([]);
  });

  test('Admin orders fulfillment queue (/admin/orders) passes automated accessibility audit', async ({
    page,
  }) => {
    await page.goto('/admin/orders');
    await page.waitForLoadState('domcontentloaded');

    const scanResults = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
      .analyze();

    expect(scanResults.violations).toEqual([]);
  });
});
