#!/bin/env ruby
require 'csv'
require 'nokogiri'
require 'json'

GOOGLE_DOCS_10GEN_EMPLOYEE_CONTACTS = '10gen Employee Contacts - Employee Contact Info.csv'
TENGEN_TEAM_PICTURES_AND_BIOS = '10gen+Team+Pictures+and+Bios.html'

FIRST_NAME_KEY = 'First Name'
LAST_NAME_KEY = 'Last Name'
FULL_NAME_KEY = 'Full Name'
SEAT_KEY = 'Seat'

class Array
  def warn_missing(key)
    each{|row| STDERR.puts "warning: missing #{key.inspect}: #{row.inspect}" if !row[key] || row[key].empty?}
  end

  def select_first_name_last_name
    select{|doc| doc[FIRST_NAME_KEY] && doc[LAST_NAME_KEY]}
  end

  def set_full_name
    collect{|doc|doc.merge(FULL_NAME_KEY => "#{doc[FIRST_NAME_KEY]} #{doc[LAST_NAME_KEY]}")}
  end

  def hash_by(key)
    Hash[*collect{|doc| [doc[key], doc]}.flatten]
  end
end

class String
  def doc_per_line
    gsub(/\},/, "},\n")
  end
end

def wiki_page_file_to_docs(file_name)
  dom = Nokogiri::HTML(open(file_name))
  tbody = dom.css('.wiki-content table.confluenceTable tbody')
  tbody.css('tr').collect do |elem|
    col = elem.css('td')
    if col.empty? || col.size < 2
      nil
    else
      imgs = col[0].css('img')
      img = imgs.empty? ? nil : imgs.first.attr('src')
      nodes = col[1].children
      nodes.shift while (nodes.first.text == " ")
      full_name = nodes.shift.text.strip
      name_array = full_name.split(/\s+/)
      first_name = name_array.first
      last_name = name_array.last
      bio = nodes.text.strip.tr(" \n", '  ')
      {
          'Full Name' => full_name,
          "First Name" => first_name,
          "Last Name" => last_name,
          'Photo' => img,
          "Bio" => bio
      }
    end
  end.compact
end

def csv_file_to_docs(file_name)
  rows = CSV.read(file_name).collect{|row| row[0] ? row : nil}.compact # filter out empty rows
  keys = rows.shift
  rows.collect{|values| Hash[*keys.zip(values.collect{|value|value && value.strip}).flatten]}
end

gdoc_directory = csv_file_to_docs(GOOGLE_DOCS_10GEN_EMPLOYEE_CONTACTS)
  .warn_missing(FIRST_NAME_KEY).warn_missing(LAST_NAME_KEY)
  .set_full_name.hash_by(FULL_NAME_KEY)

team_directory = wiki_page_file_to_docs(TENGEN_TEAM_PICTURES_AND_BIOS)
  .warn_missing(FIRST_NAME_KEY).warn_missing(LAST_NAME_KEY)
  .set_full_name.hash_by(FULL_NAME_KEY) # (re)set_full_name for middle initials
team_directory.each_pair do |key, value|
  if gdoc_directory[key]
  then gdoc_directory[key].merge!(value)
  else #gdoc_directory[key] = value
    STDERR.puts "warning: team directory miss - #{key.inspect} #{value.inspect}"
  end
end

=begin
SEATS_ADDENDUM = 'seats.csv'
seat_directory = csv_file_to_docs(SEATS_ADDENDUM)
  .select_first_name_last_name
  .set_full_name.hash_by(FULL_NAME_KEY)
seat_directory.each_pair do |key, value|
  person = gdoc_directory[key]
  if person && !person[SEAT_KEY]
    STDERR.puts person[SEAT_KEY].inspect
    person[SEAT_KEY] = value[SEAT_KEY]
  else
    STDERR.puts "warning: seat directory miss - #{key.inspect} #{value.inspect}"
  end
end
# generate seats_random.csv
#STDERR.puts "Seat,First Name,Last Name"
#STDERR.puts gdoc_directory.map{|key,value| value}.sort{rand(3)-1}[1..80].each_with_index.map{|v,i|[i+1,v[FIRST_NAME_KEY],v[LAST_NAME_KEY]].join(',')}
=end

puts "personnelByFullName = #{gdoc_directory.to_json.doc_per_line};"

