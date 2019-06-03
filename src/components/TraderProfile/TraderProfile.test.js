import React from 'react';
import { mount } from 'enzyme';
import TraderProfile from './TraderProfile';

jest.mock('../ScoreChart/ScoreChartContainer', () => ({
  __esModule: true,
  // eslint-disable-next-line func-names
  ScoreChartContainer: function MockScoreChart() {
    return <div />;
  },
}));

jest.mock('./TraderInfoContainer', () => ({
  __esModule: true,
  // eslint-disable-next-line func-names
  TraderInfoContainer: function MockTraderInfo() {
    return <div />;
  },
}));

function setup(args) {
  return <TraderProfile {...args} />;
}

describe('score chart', () => {
  it('passes trader', async () => {
    const component = setup({ userID: 'trader123' });
    const wrapper = mount(component);
    expect(wrapper.find('MockScoreChart').prop('userID')).toEqual('trader123');
  });
});

describe('trader info', () => {
  it('passes trader', async () => {
    const component = setup({ userID: 'trader123' });
    const wrapper = mount(component);
    expect(wrapper.find('MockTraderInfo').prop('userID')).toEqual('trader123');
  });
});
