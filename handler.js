"use strict";

const aws = require("aws-sdk");
aws.config.update({ region: "us-east-1" });

const ses = new aws.SES();
const myEmail = process.env.EMAIL;
const myDomain = process.env.DOMAIN;

function generateResponse(code, payload) {
  return {
    statusCode: code,
    headers: {
      "Access-Control-Allow-Origin": myDomain,
      "Access-Control-Allow-Headers": "x-requested-with",
      "Access-Control-Allow-Credentials": true
    },
    body: JSON.stringify(payload)
  };
}

function generateError(code, err) {
  return {
    statusCode: code,
    headers: {
      "Access-Control-Allow-Origin": myDomain,
      "Access-Control-Allow-Headers": "x-requested-with",
      "Access-Control-Allow-Credentials": true
    },
    body: JSON.stringify(err.message)
  };
}

function generateEmailParams(body) {
  const { email, name, message } = JSON.parse(body);

  if (!email) {
    throw new Error("'Email' parameter is missing");
  } else if (!name) {
    throw new Error("'Name' parameter is missing");
  } else if (!message) {
    throw new Error("'Message' parameter is missing");
  }

  return {
    Source: myEmail,
    Destination: { ToAddresses: [myEmail] },
    ReplyToAddresses: [email],
    Message: {
      Body: {
        Html: {
          Charset: "UTF-8",
          Data: `<p><b>Name:</b> ${name}</p>
          <p><b>Message:</b> ${message}</p>`
        }
      },
      Subject: {
        Charset: "UTF-8",
        Data: `Contact form submission by ${name}!`
      }
    }
  };
}

module.exports.send = async event => {
  try {
    console.log(event, "event");
    const emailParams = generateEmailParams(JSON.stringify(event.body));
    const data = await ses.sendEmail(emailParams).promise();
    return generateResponse(200, data);
  } catch (err) {
    return generateError(500, err);
  }
};
