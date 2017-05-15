import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { BotMessagesComponent } from './bot-messages.component';

describe('BotMessagesComponent', () => {
  let component: BotMessagesComponent;
  let fixture: ComponentFixture<BotMessagesComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ BotMessagesComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(BotMessagesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
