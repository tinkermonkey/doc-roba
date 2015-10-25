# DocRoba
**DocRoba** is a platform for Selenium & Appium based automated testing well suited for large applications.

## Introduction
DocRoba is intended to smooth over some of the more cumbersome aspects of test automation while maintaining the fidelity of the testing. There tends to be a lot of data related to testing (credentials & accounts, reference documents, log files, screen shots, servers, server configuration) and keeping track of and making use of this data can often eclipse the effort required for the actual development and maintenance of the automation tools. This data is also very valuable to not only the testers, but also to the broader organisation. Qustions like "Did this page always look like that?" can (and should) be an easy question for a computer to answer, but often end up resulting in a test engineer pouring over logs or test results or spending time manually researching the answer. The data can easily become a burden instead of a goldmine. Testing serves as the nexus for all of the information regarding a product and as such should be the ultimate source of truth for the product.

* The goal of DocRoba is to make this information accessible and usable
* It is a tool for organizing and analyzing information

I'm sure there are plenty of proprietary products out there which also solve this problem with varying degrees of success. I wanted an open source solution to accent the amazing Selenium platform and didn't find anything comprehensive.

## The Concept
If you map the logical structure of your product as a series of **Nodes** connected by **Actions**, connect it to a set **Accounts** which represent users, give it knowledge of your test **Servers** and their configuration, allow it to be versioned in a way which maps to your product, and teach it what each of the nodes is supposed to look like, then you can increase your productivity and effectiveness as a tester.

If you

* Model your software as a series of **Nodes** and **Actions** similar to how a user would
* Link each Node to all relevant reference documentation (wireframes, visual designs, stories, specs, etc)
* Create a library of **Accounts** and model how different user states and conditions affect the results of the **Actions**
* Design your tests to use as little specificity as needed
* Allow your tests to navigate the **Nodes** like a map
* Log everything to a single easily filtered log
* Log screenshots of every **Node**

Then you can:

* Adapt your tests to functional changes in your software quickly and easily
* Compare one test result to another effortlessly
* Run your screenshots through visual analysis algorithms (OpenCV) to analyze them for correctness, changes, etc
* Compare the current version of your software to previous versions
* Allow your scripts to check out accounts from the library to avoid collisions
* Have your scripts hone in on why a test passes with one account but fails with another or why it passes on one server and fails on another
* Route around failed action routes dynamically to prevent unecessary test blockage
* Visually communicate a user story throughout your organization
* Create a central repository to act as the source of truth for your software's behavior

## Structure & Navigation

### Nodes
DocRoba models pages, screens, and views as **Nodes** using a logical structure with the navigational layer on top of that.

Whether it's an application or a website, the concept of a web of UI elements (pages, screens, view) connected by a series of actions is a fairly obvious and apt representation of the software. If you map all of the views and the actions that navigate among them you have a nice map of your software. This is not necessarily the most helpful mapping though as it tends to be structed in a manner which is not aligned with how a lot of people think about software. I find it helpful to have a more predictable structure that jives with my brain's aptitude for spatial navigation. For me that's a roughly hierachical structure.

Each **Node** has **Ready Code** and **Validation Code** that is executed during the test workflow so each **Node** can be validated in at general level. Tests can add additional validation as needed.

### Actions
Each **Node** can have **Actions** which consist of some code to trigger the action and some navigation routing information. A single **Action** (such as a button click) can have varied results and those are modeled as different **Routes** for the action. A **Route** is specified by some basic logic used to determine the correct route for the context of the **Action** execution as well as the destination **Node** for the **Route**.

### Automation Workflow
While there are a million ways to do test automation, eventually it all boils down to:

1. Do something
2. Wait for a result
3. Validate the result

Lather rinse repeat. In DocRoba, this is modeled thusly:

1. Do Something → This is an **Action**
2. Wait for a reault → This is **Ready Code**
3. Validate the result → This is **Validation Code**

**Actions** are executed after a **Node** is ready and valid.