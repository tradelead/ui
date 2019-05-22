import React from 'react';
import sinon from 'sinon';
import { act } from 'react-dom/test-utils';
import { mount, shallow } from 'enzyme';
import Modal from 'react-bootstrap/Modal';
import Button from 'react-bootstrap/Button';
import Alert from 'react-bootstrap/Alert';
import Spinner from 'react-bootstrap/Spinner';
import asyncMountWrapper from '../../../testUtils/asyncMountWrapper';
import asyncUpdateWrapper from '../../../testUtils/asyncUpdateWrapper';
import AppContext from '../../../AppContext';
import ExchangeKeys from './ExchangeKeys';

const sleep = async ms => new Promise(resolve => setTimeout(resolve, ms));

const ctx = {
  trader: {
    id: 'test',
    observe: sinon.stub(),
    addExchangeKey: sinon.stub(),
    deleteExchangeKey: sinon.stub(),
  },
};

let observer;
ctx.trader.observe.callsFake((args, newObserver) => { observer = newObserver; });

function setup() {
  return (
    <AppContext.Provider value={ctx}><ExchangeKeys /></AppContext.Provider>
  );
}

describe('adding key', () => {
  it('opens modal when add key clicked', () => {
    const component = setup();
    const wrapper = shallow(component).dive();
    wrapper.find({ className: 'add-key' }).find(Button).simulate('click');
    expect(wrapper.find(Modal)).toHaveProp('show', true);
  });

  it('close modal onHide', () => {
    const component = setup();
    const wrapper = shallow(component).dive();
    wrapper.find({ className: 'add-key' }).find(Button).simulate('click');
    act(() => {
      wrapper.find(Modal).prop('onHide')();
    });
    expect(wrapper.find(Modal)).toHaveProp('show', false);
  });

  it('calls add exchange key when modal form submitted', async () => {
    const component = setup();
    const wrapper = mount(component);

    const newKey = {
      exchangeID: 'binance',
      exchangeLabel: 'Binance',
      tokenLast4: 'aEwq',
      secretLast4: 'PqnB',
    };
    ctx.trader.addExchangeKey.resolves(newKey);

    const data = {
      exchangeID: 'binance',
      token: 'token123',
      secret: 'secret123',
    };

    await submitAddKeyForm(wrapper, data);

    sinon.assert.calledWith(ctx.trader.addExchangeKey, data);
  });

  it('shows loader while awaiting add key', async () => {
    const component = setup();
    const wrapper = mount(component);
    ctx.trader.addExchangeKey.callsFake(async () => {
      await sleep(100);
      return {
        exchangeID: 'binance',
        exchangeLabel: 'Binance',
        tokenLast4: 'aEwq',
        secretLast4: 'PqnB',
      };
    });

    const data = {
      exchangeID: 'binance',
      token: 'token123',
      secret: 'secret123',
    };

    await submitAddKeyForm(wrapper, data);

    expect(wrapper.find(Modal).find({ type: 'submit' }).find(Spinner)).toExist();
  });

  it('removes loader after key added', async () => {
    const component = setup();
    const wrapper = mount(component);
    ctx.trader.addExchangeKey.callsFake(async () => {
      await sleep(100);
      return {
        exchangeID: 'binance',
        exchangeLabel: 'Binance',
        tokenLast4: 'aEwq',
        secretLast4: 'PqnB',
      };
    });

    const data = {
      exchangeID: 'binance',
      token: 'token123',
      secret: 'secret123',
    };

    await submitAddKeyForm(wrapper, data);

    await act(async () => {
      await sleep(100);
      wrapper.update();
      await sleep(0);
    });

    expect(wrapper.find(Modal).find({ type: 'submit' }).find(Spinner)).toHaveLength(0);
  });

  it('closes modal after key added', async () => {
    const component = setup();
    const wrapper = mount(component);
    ctx.trader.addExchangeKey.callsFake(async () => {
      await sleep(100);
      return {
        exchangeID: 'binance',
        exchangeLabel: 'Binance',
        tokenLast4: 'aEwq',
        secretLast4: 'PqnB',
      };
    });

    const data = {
      exchangeID: 'binance',
      token: 'token123',
      secret: 'secret123',
    };

    await submitAddKeyForm(wrapper, data);

    await act(async () => {
      await sleep(100);
      wrapper.update();
      await sleep(0);
    });

    expect(wrapper.find(Modal)).toHaveProp('show', false);
  });

  it('shows error when adding key fails', async () => {
    const error = 'This is my error';
    ctx.trader.addExchangeKey.rejects(new Error(error));

    const component = setup();
    const wrapper = mount(component);

    const data = {
      exchangeID: 'binance',
      token: 'token123',
      secret: 'secret123',
    };

    await submitAddKeyForm(wrapper, data);

    expect(wrapper.find(Modal).find(Alert).find('p').text()).toEqual(error);
  });
});

it('shows current keys', async () => {
  const expectedKeys = [
    {
      exchangeID: 'binance',
      exchangeLabel: 'Binance',
      tokenLast4: 'aEwq',
      secretLast4: 'PqnB',
    },
    {
      exchangeID: 'bittrex',
      exchangeLabel: 'Bittrex',
      tokenLast4: '24aq',
      secretLast4: '4elH',
    },
  ];

  const component = setup();
  const wrapper = await asyncMountWrapper(component);
  act(() => observer({ exchangeKeys: expectedKeys }));
  await asyncUpdateWrapper(wrapper);

  expectedKeys.forEach((key) => {
    assertKeyDisplayed(wrapper, key);
  });
});

it('shows error when fails to get current keys', async () => {
  const component = setup();
  const wrapper = await asyncMountWrapper(component);
  act(() => observer(null, null, new Error('blah blah blah')));
  await asyncUpdateWrapper(wrapper);

  expect(wrapper.find('.exchange-keys .error')).toExist();
});

describe('delete key', () => {
  const expectedKeys = [
    {
      exchangeID: 'binance',
      exchangeLabel: 'Binance',
      tokenLast4: 'aEwq',
      secretLast4: 'PqnB',
    },
    {
      exchangeID: 'bittrex',
      exchangeLabel: 'Bittrex',
      tokenLast4: '24aq',
      secretLast4: '4elH',
    },
  ];

  const mountAndClickDeleteOnFirstKey = async () => {
    const component = setup();
    const wrapper = await asyncMountWrapper(component);
    act(() => observer({ exchangeKeys: expectedKeys }));
    await asyncUpdateWrapper(wrapper);

    await act(async () => wrapper.find('.exchange-key .delete').first().simulate('click'));

    return wrapper;
  };

  it('calls deleteExchangeKey', async () => {
    await mountAndClickDeleteOnFirstKey();

    sinon.assert.calledWith(
      ctx.trader.deleteExchangeKey,
      { exchangeID: expectedKeys[0].exchangeID },
    );
  });

  it('marks loading while await response', async () => {
    ctx.trader.deleteExchangeKey.returns(sleep(100));

    const wrapper = await mountAndClickDeleteOnFirstKey();

    await act(async () => {
      wrapper.update();
      await sleep(0);
    });

    expect(wrapper.find('.exchange-key .delete').first().find('.delete-loading')).toExist();
  });

  it('marks not loading after response', async () => {
    ctx.trader.deleteExchangeKey.callsFake(async () => {
      await sleep(100);
      // since deleted, update observer without that key
      act(() => observer({
        exchangeKeys: [{
          exchangeID: 'bittrex',
          exchangeLabel: 'Bittrex',
          tokenLast4: '24aq',
          secretLast4: '4elH',
        }],
      }));
    });

    const wrapper = await mountAndClickDeleteOnFirstKey();

    await act(async () => {
      await sleep(100);
      wrapper.update();
      await sleep(0);
    });

    expect(wrapper.find('.exchange-key .delete').first().find('.delete-loading')).toHaveLength(0);
  });

  it('displays error if request fails', async () => {
    const error = 'this is my error';
    ctx.trader.deleteExchangeKey.rejects(new Error(error));

    const wrapper = await mountAndClickDeleteOnFirstKey();

    await act(async () => {
      wrapper.update();
      await sleep(0);
    });

    expect(wrapper.find('.exchange-key').first().find('div.error').text()).toContain(error);
  });
});

async function submitAddKeyForm(wrapper, data) {
  wrapper.find('.add-key').find(Button).simulate('click');

  wrapper.find(Modal).find('select').find({ name: 'exchangeID' })
    .simulate('change', { target: { value: data.exchangeID } });

  wrapper.find(Modal).find('input').find({ name: 'token' })
    .simulate('change', { target: { value: data.token } });

  wrapper.find(Modal).find('input').find({ name: 'secret' })
    .simulate('change', { target: { value: data.secret } });

  await act(async () => {
    wrapper.find(Modal).find('form').simulate('submit');
    await sleep(0);
    wrapper.update();
    await sleep(0);
  });
}

function assertKeyDisplayed(wrapper, key) {
  const row = wrapper
    .find('.exchange-keys .exchange-key')
    .filterWhere(n => n.find('.exchange').text() === key.exchangeLabel);

  expect(row).toExist();

  expect(row.find('.tokenLast4').text()).toContain(key.tokenLast4);
  expect(row.find('.secretLast4').text()).toContain(key.secretLast4);
}
