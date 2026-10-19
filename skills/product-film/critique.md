# Product film: critique

Judge the film as a stranger seeing it in a feed, with the sound off first.

Look at: the key-frame sheet of every shape (`--all --times key --sheet`), the
phone sheet of every shape (`--all --phone`), 12-frame strips at every whip,
pull-back and flood (`--strip <t>`, in wide and in tall), the MP4 twice (once
for the picture, once for the sound), and `STORY.md`'s claims.

## Score each 1–10

1. **Story:** with the sound off, could a stranger retell it: who it's for
   and the problem (by 4 s), what the product is (named at the turn), each
   step and what it got them, the goal reached, and what to do next (on
   screen to the last frame)? Every step's result answers its caption; the
   steps add up to one goal, not a tour of features.
2. **Truth:** every screen is a real capture; every claim has a source in
   `STORY.md`; the data is sample data.
3. **Breathing room (any score under 8 here caps the film at 7):** a viewer
   seeing it once can process every step: the caption is read before
   anything moves, the element in play is seen on its own before it is
   acted on, nothing is clicked the instant the camera arrives, and each
   result holds at least a second before the next caption. Check it at every
   click and every result. If a step is rushed, lengthen the film.
4. **Proof craft:** each step isolates one element, the cursor acts on beats,
   the real UI answers each action, and a page it opens arrives on a cut.
5. **Motion:** every travel is fast out of the blocks with a long soft settle;
   whips land soft; nothing stops dead or short; the camera holds still during
   gestures; a state changes only in its own regions.
6. **Readability:** on every shape's phone sheet, every word meant to be read
   is readable; nothing is under the floor (2.4% of the short side).
7. **Shapes:** each is laid out for its frame; tall frames a narrower part of each screen so the UI keeps its size.
8. **Rhythm and sound:** cuts and clicks land on beats; a break before each
   result; a sound on every action; loudness around −14 LUFS.
9. **Brand:** the product's colour as the one accent, used for meaning; the
   product's words.

## Hunt for

- **Type centred in its container** (pills, buttons, chips, badges, a word beside a mark): the capitals sit on the container's centre line, measured, not by eye. Words that ride high are the usual fault (textBaseline 'middle' and CSS line boxes both centre the font's em box, not the letters); draw with `kit.centreText`, and in HTML use `text-box: trim-both cap alphabetic` with equal padding. The quick test fails canvas text set with 'middle'; captured screens and HTML are checked on the stills.
- **The film's own shapes, finished:** every click has a press state on its visual onset (what's pressed sinks a few percent and lights or darkens, then comes back), and a held control shows it's held; apertures and reveals are clean circles or the product's own shapes, never blades or drawn lines; a shape that becomes another does it in one continuous move, not a chain of in-between shapes; a pulse is one thin ring that thins as it grows; nothing (a check, a label, an icon) vanishes or appears in a single frame at a hand-off: it moves, shrinks or is covered. Check each on a strip of consecutive frames from the MP4.
- text over text, or a word cut by a frame edge or a rounded corner;
- the cursor covering what it points at, or moving while the camera moves;
- a capture shown past its sharpness (soft text);
- an isolated control that can't be read on its own (a list without its
  title, a field without its label);
- a hook line left standing among struck ones, or a struck line the viewer
  still wants;
- a turn that could still be describing the problem, or that answers
  something the hook didn't say;
- in tall, an answer whose evidence the phone layout hid (a folded filter, a missing axis label);
- a step that relies on context off screen (a filter set earlier, out of
  view), or that ends on a view too wide to read;
- a colour field covering the control it should isolate;
- a state change with no click, or a click with no change;
- an action the viewer can't follow: a click within half a second of the camera arriving, a result gone in under a second, a caption replaced before it can be read;
- a frame where nothing can be read (between moves is fine, a hold is not);
- the ask leaving early, or a last frame with only a logo;
- anything taken from another company's film: words, scenes, characters,
  logos.

For each issue write the shape, the time, what's wrong and the exact fix
("tall, 9.2 s: Copied is cut by the frame: lower kRow by 10%"). Fix the
worst three, review again, score again. Nothing ships below 8. After three
rounds, report what remains instead of claiming the film is finished.

With each fix, write what it must keep (the timing, sizes and moves
already right) and the times to look at again; look at them, and at the
cuts either side, before scoring again. If the same problem survives two
fixes, stop fixing it and report it with what you tried. Never loosen a
check, a size floor or the bar to get a pass.
