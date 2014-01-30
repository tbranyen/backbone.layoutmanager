module.exports = ->

  @config "benchmark",
    options:
      displayResults: true

    all:
      src: ["test/benchmark/*.js"]
      dest: "test/report/benchmark_results.csv"

  #@loadNpmTasks "grunt-benchmark"
