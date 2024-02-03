# CS 290 Portfolio Project Code

This branch holds the code and commit history for my CS 290 (Web Development) group project. Since there are many commits that make up the history of the code and I had a partner working on this project I decided it would be less cluttered in a seperate branch.

## Copyright information

This code is to be used soley for demonstration purposes and should not be copied or reproduced for comercial or other purposes.

---

**Below is a recreation of the given critera, instructions, and expectations for completing the assignment.**

## Table of contents

- [Goals](#goals)
- [Overview](#overview)
  - [What is "Complex" Data?](#what-is-complex-data)
    - [Not complex](#not-complex)
    - [Complex](#complex)
- [Submission](#submission)
- [Scoring Overview](#scoring-overview)
  - [Midterm deliverables - 20 pts](#midterm-deliverables---20-pts)
  - [Data - 10 pts](#data---10-pts)
  - [Server functionality - 5 pts](#server-functionality---5-pts)
  - [Displays data records - 10 pts](#displays-data-records---10-pts)
  - [Page Cohesiveness - 5 pts](#page-cohesiveness---5-pts)
  - [Supports Create/Update/Delete operations - 30 pts](#supports-createupdatedelete-operations---30-pts)
  - [Planning \& Communication - 5 pts](#planning--communication---5-pts)
  - [Something extra - 20pts](#something-extra---20pts)
- [Grade/Points Recieved](#gradepoints-recieved)

## Goals

- Build a full stack web application
- Learn basic project management and collaborative software development skills

## Overview

Working as a small team, you will develop a data driven website using node/express/mongoose.

The type of data your program works on can be whatever you like and can be based on something in the real world or completely factious. The main requirement is that there must be one type of "complex" data for each team member to work on. A "complex" piece of data is one with at least 4 attributes and that needs to represent some kind of connection to at least one other type of data. (See below for examples.)

Each group member is responsible for their own "silo" or work in the project: building functionality for one of the "complex" types of data. The functionality required is an interface for CRUD operations (Create a record, Retrieve and display record(s), Update existing records, and Delete records).

It is recommended you focus on pages that an administrator would use, not an end user. In a project implementing a Library, the site should be designed as if a Librarian was going to use it and had full access to make changes to all the data. If you want to make pages that would be more appropriate for an end user of the system - say pages a Library Patron could use to update their contact info or check out books - the logic will likely be significantly more complex.

There are some places where your work will depend on basic portions of your teammates work, but only ~15% of the grade is a shared grade.

Your work for this project may not recycle work for earlier assignments or make direct use of any of the samples from the course (MDN's Library Sample, my SuperHero sample). Obviously, you will use similar ideas and techniques, but all your work on this assignment should be new for the project.

### What is "Complex" Data?

A "complex" piece of data is one with at least 4 attributes and that needs to represent some kind of connection to at least one other type of data.

Think of a data type as a class from C++. There are two requirements: 1) there are at least four member variables (attributes that we track for each item of that class); 2) we have some kind of connection to other data types - think pointer to other data type.

#### Not complex

- A Book that has a title and author that are strings ("Hamlet", "William Shakespeare") is not complex. It only has two attributes and no links.
- A Book that has a title, author, publisher that are strings and a publishDate that is not complex. It has four attributes, but no connections to other complex data.
- An Author that has name, country, birthDate, deathDate, is not complex if all of those are simple strings or dates.

To make something complex, look for ways to connect it to other custom data types.

#### Complex

- If we take the version of Book that has four attributes, and change author in Book from a string ("William Shakespeare") to actually being a link (pointer) off to an Author object, Book is now complex. (Author would not be complex yet)
- To make Author complex, we might decide that author is going to track a list of Books objects they have written (something like an array of pointers to those Books). It now is complex.

The key to making something complex is really that link/relationship/pointer(s). And to find that, you usually just have to dig deeper on one or more of the attributes we care about. Instead of having the author just be a string, let's make Author be it's own data type with lots of information. Doing that, transforms author in book from just a string, to a link to something else, which makes Book complex.

Often times the relationship will work both ways, like Book and Author. A Book knows its Author and an Author object tracks its books. But it is possible to also only have a one way link. Maybe PatronAccount (in a library system) is going to track which Books are checked out, but a Book doesn't know which PatronAccount currently has it checked out.

It is OK to have extra data types that are not "fully complex" that exist to make another object complex. Maybe I am working on Pokemon cards, and trying to make my Pokemon card object complex. Currently, it has health/power/type/cost, where type is just "Fire" or "Water". To make PokemonCard complex, I could make Type be its own thing. Maybe Type has name ("Fire"), color ("red"), and icon ("fire.jpg"). Now, PokemonCard can have its type link to one of those Type objects and it is complex. Type is not complex (it has no links). So no one could use it as their "complex data type". Instead, whoever is making Pokemon would also make Type. If you do make an extra data type, you do not have to provide web pages for interacting with it, you can just have some sample items that are loaded into your database and there will be no way to modify them.

## Submission

See elearn for instructions on submitting early and final deliverables.

In general, you will need to make sure your code is pushed to github and turn in a PDF describing what you did.

Your project must be runable from your repository without any changes or additions. I should be able to just do `npm install` and `npm run start` and then visit `localhost:3000/`.

This means that DB credentials, API keys, etc... must be stored in the repository. For a real project this would be a big no-no - credentials like that should either be stored in a config file that is not checked into source control or stored in environmental variables set on each machine.

## Scoring Overview

Although you will be doing the project in a small group, most of the score is awarded individually.

### Midterm deliverables - 20 pts

There will be at least two mid-term deliverables where your team is responsible for demonstrating working versions of portions of your site. Completing these on time will be worth 20% of the overall grade.

### Data - 10 pts

You were responsible for a type of data with multiple fields that includes references to some other data records. There is a schema defined for your data type and the database is pre-populated with a decent number of sample/starter records.

### Server functionality - 5 pts

The server as a whole functions to serve your pages and handles basic errors (404/500).

*One score awarded to everyone on team*.

### Displays data records - 10 pts

Clean, attractive pages to display existing records. Well structured pages with clean, basic styling is the goal. These do not need to be masterpieces of visual design, but should have some basic CSS to make them presentable and use ids and classes in the HTML to enable further styling. It is OK to use Bootstrap.

You should display some information about related objects and links to them.

**Writeup Question 1**: What data did you work on?

### Page Cohesiveness - 5 pts

The individual pages use a consistent navigation scheme and basic styling. The primary navigation looks similar across all the pages. There is a logical "home" page to the site.

It is fine if "something extra" features that someone adds to their pages are make them stand out. But, they should still share some of the same basic page structure and navigation.

*One score awarded to everyone on team*.

### Supports Create/Update/Delete operations - 30 pts

Provide ways to delete records, update existing records, and add new records. You should support editing the associations for your object (reference(s) to other data items).

Information should be stored in the database as logical types. Do not store numbers or dates as strings.

Delete operation should make sure nothing else in the database still refers to the removed object.

Pages for doing this should follow the same basic guidelines as for the "Display" pages.

### Planning & Communication - 5 pts

The team can provide evidence of task tracking and collaboration. The easiest ways to provide this are:

- Project boards on your github repo.
- A link to a google doc with meeting notes.

*One score awarded to everyone on team*.

**Writeup Question 2**: Provide a link to where I can find this. Google doc, project boards, etc... If necessary, attach to submission as a separate PDF.

### Something extra - 20pts

Doing a good job on the expected work is 80% of the assignment. The last 20% can be earned by doing something(s) not explicitly requested.

**Writeup Question 3:**

- What is your something extra?
- Provide CLEAR instructions on how to see it in action and/or what code I should look at to see what you did.
- What did you have to learn to get it done? What was most challenging about it?

Here are some suggestions:

- Implement "user focused" pages for your data type. These should allow an end user to interact with the records in some "real world" fashion more complex than simple create/update logic. Example: in a library program, add a feature to allow a user to checkout and return books. Books that are checked out are listed on the user's profile. A book that has been checked out is not available to other users.
- Build an AJAX based page that allows someone to dynamically sort/filter your data.
- Do something interesting with cookies/sessions to track "favorites", "recently viewed", or something similar.
- Make a json web request API for your data and document it. It should support most of the same basic CRUD options that your website interface does.
- Find a JS library that draws charts/graphs and incorporate it into one or more pages to visualize your data.
- Handle file uploads as part of your data. (e.g. You can upload an image that goes with a new record being added.)
- Do something **really** complex with the styling for your pages. A couple of style rules on top of a bootstrap based layout does not cut it here.
- Learn about [**SASS**](https://sass-lang.com/) and use the npm based [**Dart SASS**](https://www.npmjs.com/package/sass) to preprocess your CSS. This one isn't much use unless you are also doing some substantial CSS styling.

To earn the full 20%, you need to put significant effort in above the basic requirements. Effort can come through figuring out how to incorporate some complex idea, or via writing lots of code yourself. You can do multiple smaller "something extras" or one that is complex enough on its own to be significant.

Hopefully, you throw yourself into going deep into one or more things that sounds interesting to you. If you do that, you probably are going meet the "significant effort" requirement naturally. You are welcome to ask me for some feedback on whether something sounds like it is in the ballpark for qualifying for full credit. However, I will not do a formal evaluation of your work prior to grading. (In other words, you can't keep checking with me: 'is this enough?', 'how about now, is this enough?'... to min/max what you do.)

The "something extra" is per student. Group mates should do separate "something extras" - unless you get prior approval, multiple partners cannot do the same something extra. While it is fine to help each other, the goal is for each individual to push themselves to figure out something new.

## Grade/Points Recieved

**Total**: 76 / 80

Breakdown by category:

- [x] Page Cohesiveness [5/5]
- [x] Data [10/10]
- [x] Server functionality [5/5]
- [x] Displays data records [10/10]
- [x] Supports Create/Update/Delete operations [30/30]
- [x] Planning & Communication [5/5]
- [ ] Something Extra [11/15]
  - **Reasoning**: Moderate complexity with moderate issues. Or limited complexity with minor issues.
