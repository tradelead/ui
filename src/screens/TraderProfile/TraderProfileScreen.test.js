import React from 'react';
import sinon from 'sinon';
import { act } from 'react-dom/test-utils';
import { mount } from 'enzyme';
import AppContext from '../../AppContext';
import TraderProfileScreen from './TraderProfileScreen';

jest.mock('../../components/TraderProfile/TraderProfile', () => (
  // eslint-disable-next-line func-names
  function MockTraderProfile() {
    return <div />;
  }
));

const ctx = {
  traderService: {
    getTrader: sinon.stub(),
  },
};

async function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function setup(args) {
  return <AppContext.Provider value={ctx}><TraderProfileScreen {...args} /></AppContext.Provider>;
}

async function asyncMount(component) {
  let wrapper = null;
  await act(async () => {
    wrapper = mount(component);
    await sleep(0);
    wrapper.update();
    await sleep(0);
  });

  return wrapper;
}

it('calls traderService.getTrader with param username', async () => {
  const component = setup({ match: { params: { username: 'test' } } });
  await asyncMount(component);

  ctx.traderService.getTrader.calledWith('test');
});

it('calls traderProfile with user from traderService.getTrader', async () => {
  const obj = { id: 'test' };
  ctx.traderService.getTrader.resolves(obj);

  const component = setup({ match: { params: { username: 'test' } } });
  const wrapper = await asyncMount(component);

  expect(wrapper.find('MockTraderProfile').prop('trader')).toEqual(obj);
});

it('displays error from traderService.getTrader', async () => {
  const errMsg = 'this is my test error';
  ctx.traderService.getTrader.rejects(new Error(errMsg));

  const component = setup({ match: { params: { username: 'test' } } });
  const wrapper = await asyncMount(component);

  expect(wrapper.text()).toContain(errMsg);
});
