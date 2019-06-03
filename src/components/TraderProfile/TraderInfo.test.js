import React from 'react';
import asyncMountWrapper from '../../testUtils/asyncMountWrapper';
import TraderInfo from './TraderInfo';

jest.mock('../TraderImg/TraderImg', () => (
  // eslint-disable-next-line func-names
  function MockTraderImg() {
    return <div />;
  }
));

// eslint-disable-next-line react/prop-types
function setup({ props }) {
  return <TraderInfo {...props} />;
}

let props = {};
beforeEach(() => {
  props = {
    info: {
      username: 'tradername',
      bio: 'This is my bio \ntest line break.',
      website: 'http://test.com',
      profilePhoto: { url: 'http://test.com/image.jpg' },
    },
    loading: false,
    errors: undefined,
  };
});

it('displays trader profile photo', async () => {
  const component = setup({ props });
  const wrapper = await asyncMountWrapper(component);

  expect(wrapper.find('MockTraderImg').prop('src')).toEqual(props.info.profilePhoto.url);
  expect(wrapper.find('MockTraderImg').prop('alt')).toEqual(props.info.username);
});

it('displays trader username', async () => {
  const component = setup({ props });
  const wrapper = await asyncMountWrapper(component);

  expect(wrapper.find('.username')).toHaveText(props.info.username);
});

it('displays trader website', async () => {
  const component = setup({ props });
  const wrapper = await asyncMountWrapper(component);

  expect(wrapper.find('.website')).toHaveText(props.info.website);
  expect(wrapper.find('.website')).toHaveProp('href', props.info.website);
});

it('displays trader bio', async () => {
  const component = setup({ props });
  const wrapper = await asyncMountWrapper(component);

  expect(wrapper.find('.bio span')).toHaveLength(2);
  expect(wrapper.find('.bio span').at(0).text()).toEqual('This is my bio ');
  expect(wrapper.find('.bio span').at(0).find('br')).toHaveLength(1);
  expect(wrapper.find('.bio span').at(1).text()).toEqual('test line break.');
  expect(wrapper.find('.bio span').at(1).find('br')).toHaveLength(1);
});

it('displays loading', async () => {
  props.loading = true;
  const component = setup({ props });
  const wrapper = await asyncMountWrapper(component);

  expect(wrapper.find('.loading')).toExist();
});

it('displays errors', async () => {
  props.errors = [
    { message: 'Test Error 1' },
    { message: 'Test Error 2' },
  ];
  const component = setup({ props });
  const wrapper = await asyncMountWrapper(component);

  expect(wrapper.find('Alert').at(0)).toHaveText('Test Error 1');
  expect(wrapper.find('Alert').at(1)).toHaveText('Test Error 2');
});
