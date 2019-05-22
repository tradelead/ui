import React from 'react';
import sinon from 'sinon';
import { act } from 'react-dom/test-utils';
import asyncMountWrapper from '../../testUtils/asyncMountWrapper';
import asyncUpdateWrapper from '../../testUtils/asyncUpdateWrapper';
import TraderInfo from './TraderInfo';

jest.mock('../TraderImg/TraderImg', () => (
  // eslint-disable-next-line func-names
  function MockTraderImg() {
    return <div />;
  }
));

const mockTrader = {
  id: 'test',
  username: 'testUsername',
  observe: sinon.stub(),
};

let observer;
mockTrader.observe.callsFake((args, newObserver) => { observer = newObserver; });

function setup() {
  return <TraderInfo trader={mockTrader} />;
}

describe('calls observe', () => {
  beforeAll(async () => {
    const component = setup();
    await asyncMountWrapper(component);
  });

  it('calls with bio', async () => {
    sinon.assert.calledWithMatch(
      mockTrader.observe,
      sinon.match.array.contains(['bio']),
      sinon.match.any,
    );
  });

  it('calls with website', async () => {
    sinon.assert.calledWithMatch(
      mockTrader.observe,
      sinon.match.array.contains(['website']),
      sinon.match.any,
    );
  });
});

it('displays trader profile photo', async () => {
  const component = setup();
  const wrapper = await asyncMountWrapper(component);

  expect(wrapper.find('MockTraderImg').prop('trader')).toEqual(mockTrader);
  expect(wrapper.find('MockTraderImg').prop('size')).toEqual('thumbnail');
});

it('displays trader username', async () => {
  const component = setup();
  const wrapper = await asyncMountWrapper(component);

  expect(wrapper.text()).toContain(mockTrader.username);
});

it('displays trader bio', async () => {
  const component = setup();
  const wrapper = await asyncMountWrapper(component);
  act(() => observer({ bio: 'This is my bio \ntest line break.' }));
  await asyncUpdateWrapper(wrapper);

  expect(wrapper.find('.bio span')).toHaveLength(2);
  expect(wrapper.find('.bio span').at(0).text()).toEqual('This is my bio ');
  expect(wrapper.find('.bio span').at(0).find('br')).toHaveLength(1);
  expect(wrapper.find('.bio span').at(1).text()).toEqual('test line break.');
  expect(wrapper.find('.bio span').at(1).find('br')).toHaveLength(1);
});
