const { expect, use } = require('chai');
const { render } = require('@marko/testing-library');
const {
    testPassThroughAttributes,
    testEventsMigrator,
} = require('../../../common/test-utils/server');
const mock = require('../mock');
const template = require('..');

use(require('chai-dom'));

describe('breadcrumbs', () => {
    it('renders basic structure', async () => {
        const input = mock.Links;
        const { getByLabelText, getByText } = await render(template, input);

        expect(getByLabelText(input.a11yHeadingText)).has.attr('role', 'navigation');

        input.items.forEach((item) =>
            expect(getByText(item.renderBody.text)).has.property('tagName', 'A')
        );
    });

    it('renders aria-current as location for last item without href', async () => {
        const input = mock.Links_Last_Without_HREF;
        const { getByText } = await render(template, input);

        input.items.forEach((item, i) => {
            const itemEl = getByText(item.renderBody.text);
            expect(itemEl).has.property('tagName', 'A');
            if (item.href) {
                expect(itemEl).has.attr('href', item.href);
            } else if (i === input.items.length - 1) {
                expect(itemEl).attr('aria-current', 'location');
            } else {
                // error state, because for this test, each item should either have an href or aria-current for the last one
                expect(true).to.equal(false);
            }
        });
    });

    it('renders different heading tag when specified', async () => {
        const input = mock.Links_Heading_Tag;
        const { getByText } = await render(template, input);
        expect(getByText(input.a11yHeadingText)).has.property(
            'tagName',
            input.a11yHeadingTag.toUpperCase()
        );
    });

    it('renders buttons when hrefs are missing', async () => {
        const input = mock.Buttons;
        const { getByText } = await render(template, input);
        input.items.forEach((item) =>
            expect(getByText(item.renderBody.text)).has.property('tagName', 'BUTTON')
        );
    });
});

testEventsMigrator(require('../migrator'), 'breadcrumbs', ['select'], '../index.marko');
testPassThroughAttributes(template);
testPassThroughAttributes(template, {
    child: {
        name: 'items',
        multiple: true,
    },
});
