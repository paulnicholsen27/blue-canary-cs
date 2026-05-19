---
title: The Web Is Not a Canvas
description: ""
date: 2026-05-19
tags:
  - web design
  - html
  - web
  - web development
  - JavaScript
  - progressive enhancement
  - frontend
  - opinion
---
We spend so much time arguing about frameworks that we keep forgetting what the medium is actually for.

Every few years, web development reinvents itself. New bundlers, new rendering strategies, new component models. The community cycles through opinions the way fashion cycles through silhouettes: what was embarrassing last decade becomes interesting again, with a new name and a conference talk attached.

Right now the conversation has settled into a familiar shape. On one side you have people who think the browser has become too complicated, who argue for server rendering and progressive enhancement and HTML that just works. On the other side are the people building apps that genuinely need the browser to behave like a desktop operating system, who think the complexity is earned and the critics are mostly nostalgic.

Both groups are right about different things. That's what makes the argument so hard to resolve.

> The question was never "Should this be a website or an app?" The question was always "*What does the person on the other end actually need?*"

## How we got here

Go back far enough and web development was not really a discipline at all. It was something you did on the side, usually a mix of HTML you half-understood and JavaScript copied from forums. The browser was a document viewer that occasionally ran scripts. The idea that you would build a word processor or a spreadsheet or a video editor inside it would have sounded like a joke.

Then Gmail arrived and the joke became a product roadmap. Suddenly the browser was a runtime, and every company wanted their slice of it. The tools that followed--jQuery to Angular to React to whatever comes next--were each trying to answer the same question: how do you build software inside something that was not designed to run software?

The answer, for the last decade or so, has been to bring the browser closer to the thing we already knew. Component trees that look like UI frameworks. State management that looks like backend architecture. Build pipelines that look like compiled languages. We kept reaching for the familiar.

## What gets lost

The web has properties that no other medium has. Links are real things with addresses. Pages can be shared, bookmarked, indexed, read aloud. Content can arrive before JavaScript runs. Forms have worked since before most working developers were born.

A lot of modern web development implicitly treats these as limitations to work around. You see it in single-page apps that break the back button, in hydration strategies that ship megabytes of JavaScript to reconstruct what the server already computed, in authentication flows that cannot survive a refresh. The browser's native model gets swapped out for a custom one that has to be rebuilt from scratch every time there's a new hire.

None of this is because developers are careless. It's because the incentive structure pulls in this direction. Fast iteration rewards ignoring constraints. Component libraries give you something that looks polished before you've thought about what it costs. The tooling makes the wrong path almost as easy as the right one.

## The signals worth paying attention to

Something has been shifting in the last couple of years. Not a revolution, more like a correction. Server components are becoming mainstream. Edge rendering is cheap enough to matter. A growing number of developers who came up building React apps are reading about HTML elements they never knew existed and discovering that the platform already solved the problem.

This is not a return to simplicity, exactly. The applications being built today are genuinely more complex than what the early web was designed for. But there's a renewed interest in meeting the browser on its own terms first, and only adding complexity when it earns its place.

That's the disposition worth cultivating. Not "use less JavaScript" as a rule, but "know what you're trading when you add more." Not "HTML is enough," but "have you actually checked whether HTML is enough?"

## The part that doesn't change

Frameworks will keep arriving. The syntax will keep changing. The debates on social media will keep running in circles. But under all of it, the web is still a medium designed to connect people to information across unreliable networks on devices you don't control. That constraint is not going anywhere.

The developers who do consistently good work are the ones who hold that constraint in mind when they're making decisions. They're the ones who ask what happens on a slow connection, who check accessibility before launch rather than after, who notice when a page is loading three seconds of JavaScript to display four paragraphs of text.
