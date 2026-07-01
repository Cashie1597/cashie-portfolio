(function () {
  "use strict";

  var shell = document.getElementById("command-palette");
  var input = document.getElementById("command-input");
  var list = document.getElementById("command-list");
  var output = document.getElementById("command-output");
  var openers = document.querySelectorAll("[data-command-open]");
  var closers = document.querySelectorAll("[data-command-close]");
  var lastFocus = null;
  var activeIndex = 0;

  if (!shell || !input || !list || !output) return;

  var githubUrl = "https://github.com/Cashie1597";
  var commands = [
    {
      name: "help",
      summary: "List available commands",
      run: function () {
        write("Available commands", commands.map(function (command) {
          return "<code>" + command.name + "</code> — " + command.summary;
        }));
      }
    },
    {
      name: "projects",
      summary: "Show shipped and building work",
      run: function () {
        write("Projects", [
          "<strong>Shipped:</strong> <a href=\"https://plumfile.space\" target=\"_blank\" rel=\"noopener noreferrer\">PlumFile</a>, Polish By Piper, Cashie Admin Hub",
          "<strong>Building:</strong> PlumClip, PlumWall",
          "<strong>Prototype:</strong> Signal Shelf"
        ]);
      }
    },
    {
      name: "services",
      summary: "Show service categories",
      run: function () {
        write("Services", [
          "Small business websites",
          "Booking pages",
          "Admin dashboards",
          "Automations",
          "Mac utilities",
          "Working prototypes"
        ]);
      }
    },
    {
      name: "process",
      summary: "Show the build process",
      run: function () {
        write("Process", [
          "<strong>Define:</strong> clarify the job, users, must-haves, and scope limits",
          "<strong>Shape:</strong> map flow, screens, data, and handoff points",
          "<strong>Build:</strong> create the working version in focused passes",
          "<strong>Hand over:</strong> package the work with clear notes"
        ]);
      }
    },
    {
      name: "contact",
      summary: "Show contact options",
      run: function () {
        write("Contact", [
          "Email: <a href=\"mailto:lochieboo1208@gmail.com?subject=Project%20enquiry\">lochieboo1208@gmail.com</a>",
          "Brief: <a href=\"apply.html\">Start the project brief</a>",
          "Best first message: problem, audience, ideal outcome, deadline, constraints"
        ]);
      }
    },
    {
      name: "book",
      summary: "Open the project brief",
      run: function () {
        window.location.href = "apply.html";
      }
    },
    {
      name: "github",
      summary: "Open GitHub profile",
      run: function () {
        if (!githubUrl) {
          write("GitHub", ["GitHub link not configured"]);
          return;
        }
        window.open(githubUrl, "_blank", "noopener,noreferrer");
        write("GitHub", ["Opening <a href=\"" + githubUrl + "\" target=\"_blank\" rel=\"noopener noreferrer\">" + githubUrl + "</a>"]);
      }
    },
    {
      name: "plumfile",
      summary: "Open PlumFile — browser PDF tools",
      run: function () {
        window.open("https://plumfile.space", "_blank", "noopener,noreferrer");
        write("PlumFile", [
          "Opening <a href=\"https://plumfile.space\" target=\"_blank\" rel=\"noopener noreferrer\">plumfile.space</a>",
          "60 browser-side PDF and file tools · no upload · neon UI"
        ]);
      }
    },
    {
      name: "status",
      summary: "Show studio status",
      run: function () {
        write("Studio status", [
          "Cashie.dev online",
          "Sydney builder",
          "Current focus: small builds, dashboards, Mac tools",
          "Latest ship: <a href=\"https://plumfile.space\" target=\"_blank\" rel=\"noopener noreferrer\">PlumFile</a> at plumfile.space"
        ]);
      }
    },
    {
      name: "clear",
      summary: "Clear command output",
      run: function () {
        output.innerHTML = "";
      }
    },
    {
      name: "close",
      summary: "Close the palette",
      run: closePalette
    }
  ];

  function escapeHtml(value) {
    return String(value).replace(/[&<>"']/g, function (char) {
      return {
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        "\"": "&quot;",
        "'": "&#39;"
      }[char];
    });
  }

  function filteredCommands() {
    var query = input.value.trim().toLowerCase();
    if (!query) return commands;
    return commands.filter(function (command) {
      return command.name.indexOf(query) !== -1 || command.summary.toLowerCase().indexOf(query) !== -1;
    });
  }

  function renderList() {
    var items = filteredCommands();
    if (activeIndex >= items.length) activeIndex = Math.max(0, items.length - 1);
    list.innerHTML = "";

    if (!items.length) {
      var empty = document.createElement("p");
      empty.className = "command-muted";
      empty.textContent = "No matching command. Type help to reset.";
      list.appendChild(empty);
      return;
    }

    items.forEach(function (command, index) {
      var item = document.createElement("button");
      item.type = "button";
      item.className = "command-item" + (index === activeIndex ? " is-active" : "");
      item.setAttribute("role", "option");
      item.setAttribute("aria-selected", index === activeIndex ? "true" : "false");
      item.innerHTML = "<strong>" + escapeHtml(command.name) + "</strong><span>" + escapeHtml(command.summary) + "</span>";
      item.addEventListener("mouseenter", function () {
        activeIndex = index;
        renderList();
      });
      item.addEventListener("click", function () {
        input.value = command.name;
        runCommand(command.name);
      });
      list.appendChild(item);
    });
  }

  function write(title, rows) {
    output.innerHTML = "<h3>" + title + "</h3><ul>" + rows.map(function (row) {
      return "<li>" + row + "</li>";
    }).join("") + "</ul>";
  }

  function runCommand(value) {
    var name = (value || input.value).trim().toLowerCase();
    var command = commands.filter(function (item) { return item.name === name; })[0];

    if (!command) {
      write("Command not found", [
        "<code>" + escapeHtml(name || "empty") + "</code> is not available",
        "Type <code>help</code> to see the command list"
      ]);
      return;
    }

    command.run();
    if (name !== "clear" && name !== "close" && name !== "book") {
      input.value = "";
      activeIndex = 0;
      renderList();
    }
  }

  function openPalette() {
    lastFocus = document.activeElement;
    shell.hidden = false;
    document.body.style.overflow = "hidden";
    input.value = "";
    activeIndex = 0;
    renderList();
    window.setTimeout(function () { input.focus(); }, 0);
  }

  function closePalette() {
    shell.hidden = true;
    document.body.style.overflow = "";
    if (lastFocus && typeof lastFocus.focus === "function") lastFocus.focus();
  }

  openers.forEach(function (opener) {
    opener.addEventListener("click", openPalette);
  });

  closers.forEach(function (closer) {
    closer.addEventListener("click", closePalette);
  });

  input.addEventListener("input", function () {
    activeIndex = 0;
    renderList();
  });

  input.addEventListener("keydown", function (event) {
    var items = filteredCommands();
    if (event.key === "ArrowDown") {
      event.preventDefault();
      activeIndex = Math.min(activeIndex + 1, Math.max(0, items.length - 1));
      renderList();
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      activeIndex = Math.max(activeIndex - 1, 0);
      renderList();
    } else if (event.key === "Enter") {
      event.preventDefault();
      var selected = items[activeIndex];
      runCommand(selected ? selected.name : input.value);
    } else if (event.key === "Escape") {
      event.preventDefault();
      closePalette();
    }
  });

  document.addEventListener("keydown", function (event) {
    var isCommandK = (event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k";
    if (isCommandK) {
      event.preventDefault();
      if (shell.hidden) openPalette();
      else closePalette();
    } else if (event.key === "Escape" && !shell.hidden) {
      event.preventDefault();
      closePalette();
    }
  });

  renderList();
})();
