require('jsdom-global')();

const { getData } = require('./main');

test('getData function exists', () => {
    expect(getData).toBeDefined();
});

test('getData function returns data', async () => {
    const data = await getData('london');
    expect(data).toBeDefined();
    expect(data).toHaveProperty('forecast');
});
