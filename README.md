# Pomodoro Art

A friendly Pomodoro timer that shows you a real painting while you focus.

A *Pomodoro timer* is a countdown clock that helps you work without distractions. This one has a twist: a painting from the Metropolitan Museum of Art (the Met) starts out very blurry. As the time counts down, it slowly gets clearer. When the time is up, the painting is fully sharp.

## How it works

- **Start:** press **Start** and the countdown begins. The painting is blurry at first and gets a little clearer every moment.
- **Pause and Resume:** press **Pause** to stop the clock. The painting stays just as blurry as it was. Press **Resume** to carry on.
- **Reset:** press **Reset** at any time to go back to the start. The timer goes back to 25:00 and the painting is blurry again. You keep the same painting.
- **Set the timer length:** before you press Start, you can type your own **Minutes** and **Seconds**. The shortest time is 00:30 and the longest is 120:00. The normal length is 25:00. You can't change the length once the timer has started. If you type a time that doesn't work, a small pop-up tells you what to fix.
- **At 00:00:** the painting is fully sharp. You will see the painting's **name**, the **artist**, the **year**, and a link to read more about it on the Met's website (it opens in a new tab).
- **Restart session:** press this button after the timer ends to start over with a **new painting**.

## Where the paintings come from

The paintings come from the Met's free public [Collection API](https://metmuseum.github.io/). (An API is a way for one website to ask another website for information.)

- The app only uses paintings that are in the public domain (free for everyone to use) and that have a picture.
- It picks a painting at random from the Met's European Paintings collection.
- The name, artist, year and link all come straight from the Met. Nothing is made up.
- You don't need an API key (a secret password) to use it. The app's code doesn't use one.

## What happens when something goes wrong

- If a painting has no picture or can't be used, the app quietly tries another one (up to 5 times).
- If the Met doesn't answer, or something else goes wrong, you will see this message where the painting should be: *"We couldn't load a painting right now. You can still use the timer. Refresh the page to try again."*
- **The timer still works** even when no painting loads.

## See the app

[add live link here]

## Credits

- Paintings and details: [The Metropolitan Museum of Art](https://www.metmuseum.org/), Open Access collection.
- Built by [your name].
