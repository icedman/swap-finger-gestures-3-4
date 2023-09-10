/* extension.js
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 2 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 *
 * SPDX-License-Identifier: GPL-2.0-or-later
 */

/* exported init */

// const Main = imports.ui.main;
import * as Main from 'resource:///org/gnome/shell/ui/main.js';

export default class Extension {
  constructor() {}

  enable() {
    this._swipeMods = [
      Main.overview._swipeTracker._touchpadGesture,
      Main.wm._workspaceAnimation._swipeTracker._touchpadGesture,
      Main.overview._overview._controls._workspacesDisplay._swipeTracker
        ._touchpadGesture,
      // Main.overview._overview._controls._appDisplay._swipeTracker._touchpadGesture
    ];

    this._swipeMods.forEach((g) => {
      g._newHandleEvent = (actor, event) => {
        event._get_touchpad_gesture_finger_count =
          event.get_touchpad_gesture_finger_count;
        event.get_touchpad_gesture_finger_count = () => {
          return event._get_touchpad_gesture_finger_count() == 4 ? 3 : 0;
        };
        return g._handleEvent(actor, event);
      };

      global.stage.disconnectObject(g);
      global.stage.connectObject(
        'captured-event::touchpad',
        g._newHandleEvent.bind(g),
        g
      );
    });
  }

  disable() {
    this._swipeMods.forEach((g) => {
      global.stage.disconnectObject(g);
      global.stage.connectObject(
        'captured-event::touchpad',
        g._handleEvent.bind(g),
        g
      );
    });
    this._swipeMods = [];
  }
}

function init() {
  return new Extension();
}
