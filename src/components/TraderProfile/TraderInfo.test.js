import React from 'react';
import sinon from 'sinon';
import { mount } from 'enzyme';
import { act } from 'react-dom/test-utils';
import TraderInfo from './TraderInfo';

const mockTrader = {
  id: 'test',
  username: 'testUsername',
  get: sinon.stub(),
};

mockTrader.get.resolves({});

function setup() {
  return <TraderInfo trader={mockTrader} />;
}

async function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
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

it('displays trader profile photo', async () => {
  mockTrader.get.withArgs([{ key: 'profilePhoto', size: 'thumbnail' }])
    .resolves({ profilePhoto: { url: 'http://test.com/image.jpeg' } });

  const component = setup();
  const wrapper = await asyncMount(component);

  expect(wrapper.find('.profilePhoto img').prop('src'))
    .toEqual('http://test.com/image.jpeg');
});

it('displays trader username', async () => {
  const component = setup();
  const wrapper = await asyncMount(component);

  expect(wrapper.text()).toContain(mockTrader.username);
});

it('displays trader bio', async () => {
  mockTrader.get.withArgs(sinon.match.array.contains(['bio']))
    .resolves({ bio: 'This is my bio \ntest line break.' });

  const component = setup();
  const wrapper = await asyncMount(component);

  console.log(wrapper.find('.bio').debug());
  expect(wrapper.find('.bio span')).toHaveLength(2);
  expect(wrapper.find('.bio span').at(0).text()).toEqual('This is my bio ');
  expect(wrapper.find('.bio span').at(0).find('br')).toHaveLength(1);
  expect(wrapper.find('.bio span').at(1).text()).toEqual('test line break.');
  expect(wrapper.find('.bio span').at(1).find('br')).toHaveLength(1);
});
