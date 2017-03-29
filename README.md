**Current Status:** Approaching Alpha 1

* Basic Funcationality is working
	* DocTree - Node/Action display
	* Adventure Console - Live selenium investigation
	* Test Cases - All step types
* [Overview Presentation] (https://docs.google.com/presentation/d/1thF2RjWQ2wC5umrKsTntdUJIgc3L8v2WPOdCoJR5J8c/edit?usp=sharing)

# DocRoba
**DocRoba** is a Selenium IDE whose goal is to provide a beautiful and easy to use interface for managing and analaysing test data. The key features are:

* Integrated Selenium/Appium recorder / interrogator / command tester
* Basic visual comparison analysis of screen captures
* Integrated test data managment (test accounts, credentials, etc)
* Structural model of the application under test

## Introduction
There tends to be a lot of supporting data related to testing (credentials & accounts, reference documents, log files, screen shots, servers, server configuration) and keeping track of and making use of this data can often eclipse the effort required for the actual development and maintenance of the automation tools (or even just test documentation). This data is also very valuable to not only the testers, but also to the broader organization. Questions like "Did this page always look like that?" can (and should) be an easy question for a computer to answer, but often end up resulting in a test engineer pouring over logs or test results or spending time manually researching the answer. The data can easily become a burden instead of a goldmine.

* The goal of DocRoba is to make this information accessible and usable
* It is a tool for organizing and analyzing information centered around automated information gathering & analysis (testing) 

I'm sure there are plenty of proprietary products out there which also solve this problem with varying degrees of success. I wanted an open source solution to accent the amazing Selenium platform and didn't find anything comprehensive. I also wanted to make something pretty with a focus on analytics and UX, so depending on your taste that may or may not be a feature.

DocRoba is designed for testing large complex systems with variant configuration, user types & states, and user platforms (web/mobile/native apps). It will work perfectly fine for a smaller application, but it's designed with large systems in mind.

## The Concepts
There are three guiding concepts to DocRoba:

* Test scripts can do more if they have knowledge of some basic context
* Having a good UI to easily enter this context will make managing the system easier
* If this context is human readable, it can serve as reasonably complete documentation of the product for development teams

From those three ideas we can dive into a bit of detail:

* If you map the logical structure of your product under test as a series of *Nodes* connected by discrete *Actions* then your test scripts can do some basic navigation on their own
* If you connect it to a set of *Accounts* which represent test users then it can help determine if an error is has data dependencies
* If you give it knowledge of the *Servers* you're testing on and their configurations then it can help determine if an error is configuration dependent
* Given this basic knowledge of navigation, account detail, and server configuration, the test runner can perform some basic design of experiments to encircle a problem and accelerate the failure triage
* If you integrate some basic machine vision into the analysis pipeline then you can quickly catch and validate visual anomalies that would be cumbersome to catch otherwise
* If you keep a versioned history of this information with links to reference documentation then you can quickly allow members of your team to understand the history and evolution of the product
* If you collate all of your test logs (selenium, browser console, test scripts, analysis, and server) in a simple filterable interface then you can quickly separate test script problems from real bugs and also empower developers to begin bug fixes with a full picture of the problem

## Application Under Test Modelling & Navigation

### Nodes
DocRoba models pages, screens, and views as *Nodes* as a logical structure with a navigational structure layered on top. The reason for this is to provide a stable structure (the logical structure) that is similar to a human's mental map of a product that serves as a simple relatable model of the product. The navigational data is then layered on top and the logical structure can be maintained independently.

### Actions
Each *Node* has a set of discrete *Actions* which lead to other nodes. A single *Action* (such as a button click) can have varied results (destination nodes) and those are modeled as different *Routes* for the action. The expected *Route* is specified by basic logic based that has access the full context (test setup, server configuration, account data) within which the *Action* is being executed. When a user clicks the checkout button, if they have items in their shopping cart they go to checkout, otherwise they get a message saying they have nothing in their shopping cart, etc.

### Navigation Menus
Navigational elements that appear throughout a product can be modeled as special *Nodes* (called *Nav Menus*). The *Actions* for the *Nav Menu* are mapped out like standard *Actions*. Normal *Nodes* can then include the *Nav Menu* (or multiple menus). All of the *Nav Menu* *Actions* and the logic that goes with them is then accessible from that node.

## Automation Framework
There are roughly 1,000,000 options and opinions regarding test automation languages and frameworks and all of them are fine. DocRoba's initial implementation is to use JavaScript for test scripting because it's simple, runs everywhere, and if you're testing a web app you have to at least having a passing familiarity with it. There are some nice synergies with having the same language everywhere.Specifically, DocRoba automation runs on [Node.js](https://nodejs.org) and interfaces with selenium servers/grids using [webdriver.io](http://webdriver.io/). The scripts use [fibers](https://github.com/laverdet/node-fibers) to keep the logic flow synchronous. A version 1.0 goal is to provide full support for multiple languages (python, java, etc).

### Automation Workflow
At the end of the day automation comes down to:

1. Do something
2. Wait for a result
3. Validate the result

Lather rinse repeat. In DocRoba this is modeled thusly:

1. Do Something → This is an *Action*
2. Wait for a result → The "wait" logic is *Ready Code* for a node
3. Validate the result → This is *Validation Code* for a node

In the normal automation flow *Actions* are only executed after a *Node* has been determined to be ready and the validation checks have been run.

< insert more words here... >