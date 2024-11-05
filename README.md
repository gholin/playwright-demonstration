# Test Demonstration (playwright-demonstration)

The purpose of this project is to demonstrate a small application with unit, e2e, component, and integration tests.

It began as a demonstration of playwright, but now I want to use it for a full testing demonstration, and as practice building
a basic full stack app that demonstrates testing.

## Table of contents

* [Initial Screens](#Initial-Screens)
* [Tech Stacks](#Tech-Stacks)
* [Future Work](#Future-Work)

## Initial Screens
For the basic demonstration app, I will only have a few screens:

Login Page
Home Page
Calculator (For unit tests)
Library (For Integration tests)
Element page(To Test all kinds of elements with E2E and component testing)


## Tech Stacks

Frontend Tech Stack:
- Javascript
- React
- HTML/CSS

Backend Tech Stack:
- .net Core with ASP

Database:
- TBD

CI/CD:
- github actions
- Gitlabs?


E2E Tech Stack:
- Playwright
- Typescript
- (I may provide examples of Pytest/Selenium and Cypress frameworks at a later date)

Component Test Tech Stack:
- RTL or Cypress

## Future Work
This section details my future plans and why things might be structured differently for now.

Currently, E2E frameworks and the app are separated into different folders(e2e and app). Here are some reasons for this:
- I want to experiment separately for now, and then I will move the E2E tests into the app itself.
- I also want to build a common playwright library (npm package) that can be imported into the app 
to share my playwright methods amongst multiple Microservices/microfrontends/apps.

