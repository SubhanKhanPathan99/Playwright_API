const fs = require('fs');
const { faker } = require('@faker-js/faker');
const   {test, expect}    = require('playwright/test')
const   {DateTime}        = require('luxon')
const tokenreqbdy  = JSON.parse(fs.readFileSync(require.resolve('../test_data/put_body.json'), 'utf8'));
const putreqbdy    = JSON.parse(fs.readFileSync(require.resolve('../test_data/post_request_body.json'), 'utf8'));
const patchreqbody = JSON.parse(fs.readFileSync(require.resolve('../test_data/patch_body.json'), 'utf8'));

test('API Request',async({request})=>{
    const firstname1        = faker.person.firstName();
    const lastname1         = faker.person.lastName();
    const totalprice1       = faker.number.int(1000);
    const checkinDate       = DateTime.now().toFormat('yyyy-MM-dd')
    const checkoutDate      = DateTime.now().plus({days:5}).toFormat('yyyy-MM-dd')
    const POSTAPIRESPONSE   = await request.post('/booking',{
      data:{
            "firstname"   : firstname1,
            "lastname"    : lastname1,
            "totalprice"  : totalprice1,
            "depositpaid" : true,
            "bookingdates":
            {
                "checkin" : checkinDate,
                "checkout": checkoutDate
            },
            "additionalneeds":"super bowls"
        }
    })

    const consolerespone = await   POSTAPIRESPONSE.json();

    console.log("$$$$$$$$$  POST RESPONE  $$$$$$$$$$")
    console.log(consolerespone)

    const bid = consolerespone.bookingid;

    //Validate status code
    expect(POSTAPIRESPONSE.ok()).toBeTruthy();
    expect(POSTAPIRESPONSE.status()).toBe(200)

    //'Validate response JSON'
    expect.soft(consolerespone.booking).toHaveProperty('firstname',firstname1)
    expect.soft(consolerespone.booking).toHaveProperty('lastname',lastname1)

    //'Validate nested JSON'
    expect.soft(consolerespone.booking.bookingdates).toHaveProperty('checkin',checkinDate)
    expect.soft(consolerespone.booking.bookingdates).toHaveProperty('checkout',checkoutDate)

    console.log("__________ GET RESPONSE __________")

    const getAPIResoponse = await request.get(`/booking/${bid}`)
    console.log(await  getAPIResoponse.json() );
    
    //Validate status code
    expect(getAPIResoponse.ok()).toBeTruthy();
    expect(getAPIResoponse.status()).toBe(200);


    console.log("===========  PUT RESPONSE  ============")


    const tokenrspn = await request.post('/auth',{
        data:tokenreqbdy
    })

    const tokenAPIrspn1 = await tokenrspn.json()
    const tokenNo1 = tokenAPIrspn1.token;
    console.log("Token No : " +tokenNo1);


    const putRspn1 = await  request.put(`/booking/${bid}`,{
        headers:{
            "Content-Type":"application/json",
            "Cookie":`token=${tokenNo1}`
        },
        data:putreqbdy
    })

    console.log(await putRspn1.json())
    //Validate status code
    expect(putRspn1.status()).toBe(200);

    console.log("|||||||||| PATCH RESPONSE |||||||||||")



    const patchRspn = await  request.patch(`/booking/${bid}`,{
        headers:{
            "Content-Type":"application/json",
            "Cookie":`token=${tokenNo1}`
        },
        data:patchreqbody
    })

    console.log(await patchRspn.json())

    expect(patchRspn.status()).toBe(200);



    console.log("^^^^^^^^  DELETE RESPONSE ^^^^^^^^^^")
    const deleteAPIResp = await request.delete(`/booking/${bid}`,{
    headers: {
        "Content-Type":"application/json",
        "Cookie":`token=${tokenNo1}`
        }
    })
    //Validate status code
    await expect(deleteAPIResp.status()).toEqual(201)
    await expect(deleteAPIResp.statusText()).toBe('Created')

})