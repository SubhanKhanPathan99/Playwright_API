const fs = require('fs');
const { faker } = require('@faker-js/faker');   // Using faker v7 (CJS supported)
const { test, expect } = require('@playwright/test');
const { DateTime } = require('luxon');

// Load JSON files manually (AWS-safe)
const tokenreqbdy  = JSON.parse(fs.readFileSync(require.resolve('../test_data/put_body.json'), 'utf8'));
const putreqbdy    = JSON.parse(fs.readFileSync(require.resolve('../test_data/post_request_body.json'), 'utf8'));
const patchreqbody = JSON.parse(fs.readFileSync(require.resolve('../test_data/patch_body.json'), 'utf8'));

test('API Request', async ({ request }) => {

    // FIXED faker API for v7.x
    const firstname1  = faker.name.firstName();
    const lastname1   = faker.name.lastName();
    const totalprice1 = faker.datatype.number({ min: 100, max: 1000 });

    const checkinDate  = DateTime.now().toFormat('yyyy-MM-dd');
    const checkoutDate = DateTime.now().plus({ days: 5 }).toFormat('yyyy-MM-dd');

    const POSTAPIRESPONSE = await request.post('/booking', {
        data: {
            firstname: firstname1,
            lastname: lastname1,
            totalprice: totalprice1,
            depositpaid: true,
            bookingdates: {
                checkin: checkinDate,
                checkout: checkoutDate
            },
            additionalneeds: "super bowls"
        }
    });

    const consolerespone = await POSTAPIRESPONSE.json();
    console.log("$$$$$$$$$ POST RESPONSE $$$$$$$$$");
    console.log(consolerespone);

    const bid = consolerespone.bookingid;

    expect(POSTAPIRESPONSE.ok()).toBeTruthy();
    expect(POSTAPIRESPONSE.status()).toBe(200);

    expect.soft(consolerespone.booking).toHaveProperty('firstname', firstname1);
    expect.soft(consolerespone.booking).toHaveProperty('lastname', lastname1);

    expect.soft(consolerespone.booking.bookingdates).toHaveProperty('checkin', checkinDate);
    expect.soft(consolerespone.booking.bookingdates).toHaveProperty('checkout', checkoutDate);

    console.log("__________ GET RESPONSE __________");

    const getAPIResoponse = await request.get(`/booking/${bid}`);
    console.log(await getAPIResoponse.json());

    expect(getAPIResoponse.ok()).toBeTruthy();
    expect(getAPIResoponse.status()).toBe(200);

    console.log("=========== PUT RESPONSE ===========");

    const tokenrspn = await request.post('/auth', {
        data: tokenreqbdy
    });

    const tokenAPIrspn1 = await tokenrspn.json();
    const tokenNo1 = tokenAPIrspn1.token;

    console.log("Token No : " + tokenNo1);

    const putRspn1 = await request.put(`/booking/${bid}`, {
        headers: {
            "Content-Type": "application/json",
            "Cookie": `token=${tokenNo1}`
        },
        data: putreqbdy
    });

    console.log(await putRspn1.json());
    expect(putRspn1.status()).toBe(200);

    console.log("|||||||||| PATCH RESPONSE |||||||||||");

    const patchRspn = await request.patch(`/booking/${bid}`, {
        headers: {
            "Content-Type": "application/json",
            "Cookie": `token=${tokenNo1}`
        },
        data: patchreqbody
    });

    console.log(await patchRspn.json());
    expect(patchRspn.status()).toBe(200);

    console.log("^^^^^^^^ DELETE RESPONSE ^^^^^^^^^");

    const deleteAPIResp = await request.delete(`/booking/${bid}`, {
        headers: {
            "Content-Type": "application/json",
            "Cookie": `token=${tokenNo1}`
        }
    });

    expect(deleteAPIResp.status()).toEqual(201);
    expect(deleteAPIResp.statusText()).toBe('Created');

});
