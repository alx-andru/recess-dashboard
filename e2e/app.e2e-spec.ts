import { RecessDashboardPage } from './app.po';

describe('recess-dashboard App', () => {
  let page: RecessDashboardPage;

  beforeEach(() => {
    page = new RecessDashboardPage();
  });

  it('should display message saying app works', () => {
    page.navigateTo();
    expect(page.getParagraphText()).toEqual('app works!');
  });
});
