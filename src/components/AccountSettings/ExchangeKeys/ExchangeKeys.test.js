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
import sleep from '../../../utils/sleep';
import AppContext from '../../../AppContext';
import ExchangeKeys from './ExchangeKeys';

let ctx = {};
let props = {};

beforeEach(() => {
  ctx = {
    user: {
      id: 'trader123',
    },
  };

  props = {
    exchanges: {
      binance: 'Binance',
      bittrex: 'Bittrex',
    },
    exchangeKeys: [
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
    ],
    loading: false,
    errors: undefined,
    addKey: sinon.stub(),
    deleteKey: sinon.stub(),
  };
});

function setup() {
  return (
    <AppContext.Provider value={ctx}><ExchangeKeys {...props} /></AppContext.Provider>
  );
}

describe('adding key', () => {
  it('opens modal when add key clicked', () => {
    const component = setup();
    const wrapper = shallow(component).dive();
    wrapper.find({ className: 'add-key' }).find(Button).simulate('click');
    expect(wrapper.find(Modal)).toHaveProp('show', true);
  });

  it('shows exchanges from app context', async () => {
    const component = setup();
    const wrapper = await asyncMountWrapper(component);
    wrapper.find({ className: 'add-key' }).find(Button).simulate('click');

    Object.keys(props.exchanges).forEach((exchangeID) => {
      const optionWrapper = wrapper
        .find({ controlId: 'formExchangeID' })
        .find({ value: exchangeID });

      expect(optionWrapper).toExist();
      expect(optionWrapper.text()).toEqual(props.exchanges[exchangeID]);
    });
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

  it('calls add key when modal form submitted', async () => {
    const component = setup();
    const wrapper = await asyncMountWrapper(component);

    const data = {
      exchangeID: 'binance',
      token: 'token123',
      secret: 'secret123',
    };

    await submitAddKeyForm(wrapper, data);
    await sleep(50);
    await asyncUpdateWrapper(wrapper);

    sinon.assert.calledWith(props.addKey, data);
  });

  it('shows loader while awaiting add key', async () => {
    const component = setup();
    const wrapper = mount(component);

    props.addKey.callsFake(async () => {
      await sleep(100);
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
    props.addKey.callsFake(async () => {
      await sleep(100);
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
    props.addKey.callsFake(async () => {
      await sleep(100);
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
    const error = new Error('This is my error');
    error.errors = [
      { message: 'Test error 1' },
      { message: 'Test error 2' },
    ];
    props.addKey.rejects(error);

    const component = setup();
    const wrapper = mount(component);

    const data = {
      exchangeID: 'binance',
      token: 'token123',
      secret: 'secret123',
    };

    await submitAddKeyForm(wrapper, data);

    expect(wrapper.find(Modal).find(Alert).find('p').at(0))
      .toHaveText('Test error 1');

    expect(wrapper.find(Modal).find(Alert).find('p').at(1))
      .toHaveText('Test error 2');
  });
});

it('shows current keys', async () => {
  const component = setup();
  const wrapper = await asyncMountWrapper(component);

  props.exchangeKeys.forEach((key) => {
    assertKeyDisplayed(wrapper, key);
  });
});

it('shows current keys after update', async () => {
  const wrapper = mount(<ExchangeKeys {...props} />);
  props.exchangeKeys[0].tokenLast4 = 'test';
  wrapper.setProps({ ...props });
  await asyncUpdateWrapper(wrapper);

  props.exchangeKeys.forEach((key) => {
    assertKeyDisplayed(wrapper, key);
  });
});

it('shows current keys after key removed', async () => {
  const wrapper = mount(<ExchangeKeys {...props} />);
  delete props.exchangeKeys[0];
  wrapper.setProps({ ...props });
  await asyncUpdateWrapper(wrapper);

  expect(wrapper.find('.exchange-key')).toHaveLength(1);
});

it('shows fetch errors', async () => {
  props.errors = [
    { message: 'Test error 1' },
  ];

  const component = setup();
  const wrapper = await asyncMountWrapper(component);

  expect(wrapper.find('.exchange-keys .error')).toExist();
});

describe('delete key', () => {
  const mountAndClickDeleteOnFirstKey = async () => {
    const component = setup();
    const wrapper = await asyncMountWrapper(component);

    await act(async () => wrapper.find('.exchange-key .delete').first().simulate('click'));

    return wrapper;
  };

  it('calls deleteKey', async () => {
    await mountAndClickDeleteOnFirstKey();

    sinon.assert.calledWith(
      props.deleteKey,
      { exchangeID: props.exchangeKeys[0].exchangeID },
    );
  });

  it('marks loading while await response', async () => {
    props.deleteKey.returns(sleep(100));

    const wrapper = await mountAndClickDeleteOnFirstKey();

    await act(async () => {
      wrapper.update();
      await sleep(0);
    });

    expect(wrapper.find('.exchange-key .delete').first().find('.delete-loading')).toExist();
  });

  it('displays error if request fails', async () => {
    const error = new Error('This is my error');
    error.errors = [
      { message: 'Test error 1' },
      { message: 'Test error 2' },
    ];
    props.deleteKey.rejects(error);

    const wrapper = await mountAndClickDeleteOnFirstKey();

    await act(async () => {
      wrapper.update();
      await sleep(0);
    });

    expect(wrapper.find('.exchange-key').first().find('.error p').at(0))
      .toHaveText('Test error 1');

    expect(wrapper.find('.exchange-key').first().find('.error p').at(1))
      .toHaveText('Test error 2');
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
    await asyncUpdateWrapper(wrapper);
    await asyncUpdateWrapper(wrapper);
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
