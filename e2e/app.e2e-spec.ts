import { RecessWebPage } from './app.po';

describe('recess-web App', function() {
  let page: RecessWebPage;

  beforeEach(() => {
    page = new RecessWebPage();
  });

  it('should display message saying app works', () => {
    page.navigateTo();
    expect(page.getParagraphText()).toEqual('app works!');
  });
});
