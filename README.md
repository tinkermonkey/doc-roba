**Current Status:** Not quite ready to use, proof-of-concept that is 80% complete

# DocRoba
**DocRoba** is a platform for Selenium & Appium based automated testing well suited for large applications.

## Introduction
DocRoba is intended to smooth over some of the more cumbersome aspects of test automation while maintaining the fidelity of the testing. There tends to be a lot of data related to testing (credentials & accounts, reference documents, log files, screen shots, servers, server configuration). Keeping track of and making use of this data can often eclipse the effort required for the actual development and maintenance of the automation tools. This data is also very valuable to not only the testers, but also to the broader organization. Questions like "Did this page always look like that?" can (and should) be an easy question for a computer to answer, but often end up resulting in a test engineer pouring over logs or test results or spending time manually researching the answer. The data can easily become a burden instead of a goldmine.

* The goal of DocRoba is to make this information accessible and usable
* It is a tool for organizing and analyzing information centered around automated information gathering & analysis (testing) 

I'm sure there are plenty of proprietary products out there which also solve this problem with varying degrees of success. I wanted an open source solution to accent the amazing Selenium platform and didn't find anything comprehensive. I also wanted to make something pretty with a focus on analytics and UX, so depending on your taste that may or may not be a feature.

## The Concept
The goal of DocRoba is to condense the human input into the test ecosystem to a minimum.

* If you map the logical structure of your product as a series of *Nodes* connected by discrete *Actions* then your test scripts can do some basic navigation on their own
* If you connect it to a set of *Accounts* which represent test users then it can help determine if an error is has data dependencies
* If give it knowledge of your test *Servers* and their configuration then it can help determine if an error is configuration dependent
* If you integrate some basic machine vision into the analysis pipeline then you can quickly catch and validate visual qualities that would be cumbersome to catch otherwise
* If you keep a versioned history with links to reference documentation then you can quickly allow members of your team to understand the implementation history, documentation history, and evolution of the product
* If you collate all of your test logs (selenium, browser console, test scripts, analysis, and server) in an easy to filter interface then you can quickly separate test script problems from real bugs and also allow developers to begin bug fixes with a complete picture

## Structure & Navigation

### Nodes
DocRoba models pages, screens, and views as *Nodes* within a logical structure with a navigational structure layered on top. The reason for this is to provide a stabile base structure that is similar to a human's mental map of a product. Navigational data is then layered on top and the logical structure can be independently maintained.

### Actions
Each *Node* has a set of discrete *Actions* which lead to other nodes. A single *Action* (such as a button click) can have varied results (destination nodes) and those are modeled as different *Routes* for the action. The expected *Route* is specified by basic logic based that has access the full context (test setup, server configuration, account data) within which the *Action* is being executed. When a user clicks the checkout button, if they have items in their shopping cart they go to checkout, otherwise they get a message saying they have nothing in their shopping cart, etc.

### Navigation Menus
Navigational elements that appear throughout a product can be modeled as special *Nodes* (called *Nav Menus*). The *Actions* for the *Nav Menu* are mapped out like standard *Actions*. Normal *Nodes* can then include the *Nav Menu* (or multiple menus). All of the *Nav Menu* *Actions* and the logic that goes with them is then accessible from that node.

## Automation
There are 1,000,000 options and opinions regarding the ideal scripting language or framework and all of them are fine. DocRoba's initial implementation is to use javascript for test scripting because it's simple, runs everywhere, and if you're testing a web app you have to at least having a passing familiarity with it. There's some nice synergy with having the same language everywhere. Eventually you will be able to choose which language to work in. Specifically it runs on [Node.js](https://nodejs.org) and interfaces with selenium servers/grids using [webdriver.io](http://webdriver.io/). The scripts use [fibers](https://github.com/laverdet/node-fibers) to keep the logic flow synchronous.

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